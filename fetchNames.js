import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(process.cwd(), 'src/locales');
const TOTAL_SPECIES = 1025;

// 完整的三語系後綴對照表
const SUFFIX_MAP = {
    "zh-Hant": {
        "-alola": " (阿羅拉)", "-galar": " (伽勒爾)", "-hisui": " (洗翠)", "-paldea": " (帕底亞)",
        "-wash": " (沖洗)", "-heat": " (加熱)", "-frost": " (結冰)", "-fan": " (旋轉)", "-mow": " (切割)",
        "-attack": " (攻擊形態)", "-defense": " (防禦形態)", "-speed": " (速度形態)",
        "-female": " (雌性)", "-male": " (雄性)", "-origin": " (起源形態)"
    },
    "en": {
        "-alola": " (Alola)", "-galar": " (Galar)", "-hisui": " (Hisui)", "-paldea": " (Paldea)",
        "-wash": " (Wash)", "-heat": " (Heat)", "-frost": " (Frost)", "-fan": " (Fan)", "-mow": " (Mow)",
        "-attack": " (Attack Forme)", "-defense": " (Defense Forme)", "-speed": " (Speed Forme)",
        "-female": " (Female)", "-male": " (Male)", "-origin": " (Origin Forme)"
    },
    "ja": {
        "-alola": " (アローラ)", "-galar": " (ガラル)", "-hisui": " (ヒスイ)", "-paldea": " (パルデア)",
        "-wash": " (ウォッシュ)", "-heat": " (ヒート)", "-frost": " (フロスト)", "-fan": " (スピン)", "-mow": " (カット)",
        "-attack": " (アタックフォルム)", "-defense": " (ディフェンスフォルム)", "-speed": " (スピードフォルム)",
        "-female": " (メス)", "-male": " (オス)", "-origin": " (オリジンフォルム)"
    }
};

const LANGUAGES = ['zh-Hant', 'en', 'ja'];

async function fetchNames() {
    console.log("🌐 正在抓取全語系 (繁/英/日) 名稱字典...");

    // 1. 同步抓取三國語系基底字典
    const [zhDict, enDict, jaDict] = await Promise.all([
        fetch("https://raw.githubusercontent.com/sindresorhus/pokemon/main/data/zh-hant.json").then(r => r.json()),
        fetch("https://raw.githubusercontent.com/sindresorhus/pokemon/main/data/en.json").then(r => r.json()),
        fetch("https://raw.githubusercontent.com/sindresorhus/pokemon/main/data/ja.json").then(r => r.json())
    ]);

    const dicts = { "zh-Hant": zhDict, "en": enDict, "ja": jaDict };
    const finalMaps = { "zh-Hant": {}, "en": {}, "ja": {} };

    // 2. 遍歷物種並匹配後綴
    for (let i = 1; i <= TOTAL_SPECIES; i++) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${i}`);
            const data = await res.json();

            for (const variety of data.varieties) {
                const vName = variety.pokemon.name.toLowerCase(); // 統一小寫 Key

                // 為三個語系分別建立名稱
                LANGUAGES.forEach(lang => {
                    let suffix = "";
                    for (const [key, val] of Object.entries(SUFFIX_MAP[lang])) {
                        if (vName.includes(key)) {
                            suffix = val;
                            break;
                        }
                    }
                    // 將基礎名稱加上對應語言的後綴 (陣列是 0-indexed，所以用 i - 1)
                    finalMaps[lang][vName] = dicts[lang][i - 1] + suffix;
                });
            }
            if (i % 100 === 0) process.stdout.write(".");
        } catch (e) {
            console.error(`\n❌ ID ${i} 翻譯抓取失敗: ${e.message}`);
        }
    }

    // 3. 建立資料夾並寫入檔案
    LANGUAGES.forEach(lang => {
        const dir = path.join(LOCALES_DIR, lang);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'pokemon-names.json'), JSON.stringify(finalMaps[lang], null, 2));
    });

    console.log("\n🎉 三語系 pokemon-names.json 已產出！");
}

fetchNames();