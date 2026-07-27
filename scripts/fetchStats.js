import fs from 'fs';
import path from 'path';

const STATS_DIR = path.join(process.cwd(), 'src/data/stats');

const GENS = [
    { id: 1, key: "generation-i", maxId: 151, system: "DV" },
    { id: 2, key: "generation-ii", maxId: 251, system: "DV" },
    { id: 3, key: "generation-iii", maxId: 386, system: "IV" },
    { id: 4, key: "generation-iv", maxId: 493, system: "IV" },
    { id: 5, key: "generation-v", maxId: 649, system: "IV" },
    { id: 6, key: "generation-vi", maxId: 721, system: "IV" },
    { id: 7, key: "generation-vii", maxId: 809, system: "IV" },
    { id: 8, key: "generation-viii", maxId: 898, system: "IV" },
    { id: 9, key: "generation-ix", maxId: 1025, system: "IV" }
];

function parseTargetGeneration(args) {
    const optionIndex = args.findIndex(arg => arg === '--gen' || arg.startsWith('--gen='));
    if (optionIndex === -1) return null;

    const option = args[optionIndex];
    const rawValue = option === '--gen' ? args[optionIndex + 1] : option.split('=')[1];
    const generation = Number(rawValue);

    if (!Number.isInteger(generation) || generation < 1 || generation > 9) {
        throw new Error('--gen 必須是 1 到 9 的整數');
    }

    return generation;
}

async function fetchStats() {
    const targetGeneration = parseTargetGeneration(process.argv.slice(2));
    const targetGens = targetGeneration === null
        ? GENS
        : GENS.filter(gen => gen.id === targetGeneration);
    const totalSpecies = Math.max(...targetGens.map(gen => gen.maxId));
    const scopeLabel = targetGeneration === null ? '全 9 世代' : `Gen ${targetGeneration}`;

    console.log(`🚀 啟動「${scopeLabel}」抓取任務...`);
    if (!fs.existsSync(STATS_DIR)) fs.mkdirSync(STATS_DIR, { recursive: true });

    // ==========================================
    // 階段一：預先抓取並快取目標世代所需資料
    // ==========================================
    console.log(`\n📥 [階段一] 正在從 PokeAPI 獲取 ${totalSpecies} 隻寶可夢基礎數據...`);
    const cache = [];

    for (let i = 1; i <= totalSpecies; i++) {
        try {
            const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}`);
            const speciesData = await speciesRes.json();

            const varietiesData = [];
            for (const variety of speciesData.varieties) {
                const vName = variety.pokemon.name.toLowerCase();
                const pokeRes = await fetch(variety.pokemon.url);
                const pokeData = await pokeRes.json();
                varietiesData.push({ vName, pokeData });
            }
            cache[i] = varietiesData;
        } catch (err) {
            console.error(`\n❌ ID ${i} 抓取失敗: ${err.message}`);
        }
        if (i % 50 === 0) process.stdout.write(".");
    }
    console.log("\n✅ [階段一] 完成！資料已全部載入記憶體。");

    // ==========================================
    // 階段二：利用快取資料產出目標世代 JSON
    // ==========================================
    console.log("\n🗂️ [階段二] 正在依據世代進行歷史數值運算與建檔...");

    for (const targetGen of targetGens) {
        const statsList = [];

        for (let i = 1; i <= targetGen.maxId; i++) {
            const varietiesData = cache[i];
            if (!varietiesData) continue; // 防錯機制

            for (const { vName, pokeData } of varietiesData) {
                // 1. 初始化數值為最新世代
                let stats = {};
                pokeData.stats.forEach(s => stats[s.stat.name] = s.base_stat);

                // 2. 時間旅行邏輯 (尋找 >= 目標世代的歷史紀錄)
                const pastRecords = pokeData.past_stats.map(ps => ({
                    ...ps,
                    genId: parseInt(ps.generation.url.split('/').filter(Boolean).pop())
                }))
                    .filter(ps => ps.genId >= targetGen.id)
                    .sort((a, b) => a.genId - b.genId);

                if (pastRecords.length > 0) {
                    pastRecords[0].stats.forEach(ps => stats[ps.stat.name] = ps.base_stat);
                }

                // 3. 第一世代 5 維度轉換
                let finalStats = { ...stats };
                if (targetGen.id === 1) {
                    finalStats = {
                        hp: stats.hp,
                        attack: stats.attack,
                        defense: stats.defense,
                        speed: stats.speed,
                        special: stats.special || stats['special-attack']
                    };
                }

                statsList.push({
                    id: i,
                    key: vName,
                    stats: finalStats,
                    system: targetGen.system
                });
            }
        }

        // 寫入硬碟 (這裡因為不需網路請求，所以幾乎是瞬間完成)
        const filePath = path.join(STATS_DIR, `gen${targetGen.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(statsList, null, 2));
        console.log(` └─ 產出完成: gen${targetGen.id}.json`);
    }

    console.log(`\n🎉 ${scopeLabel}資料產出完畢！`);
}

fetchStats();
