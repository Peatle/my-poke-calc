import fs from 'fs';
import path from 'path';

const STATS_DIR = path.join(process.cwd(), 'src/data/stats');
const LOCALES_DIR = path.join(process.cwd(), 'src/locales');
const LANGUAGES = ['zh-Hant', 'en', 'ja'];

// 終極過濾清單：明確加入 -mega-x 與 -mega-y
const EXCLUDED = [
    '-mega',        // 涵蓋一般超級進化
    '-mega-x',      // 噴火龍 X、超夢 X
    '-mega-y',      // 噴火龍 Y、超夢 Y
    '-gmax',        // 超極巨化
    '-eternamax',   // 無極汰那 (無極巨化)
    '-primal',      // 原始回歸
    '-zen',         // 達摩模式
    '-hero',        // 全能形態 (海豚俠)
    '-pirouette',  // 舞步形態 (美洛耶塔)
    '-sunshine',    // 晴天形態 (櫻花兒)
    '-noice',       // 解凍頭 (冰砌鵝)
    '-school',      // 魚群形態 (弱丁魚)
    '-blade',       // 刀劍形態 (堅盾劍怪)
    '-complete',    // 完全體形態 (基格爾德)
    '-ash',         // 小智版 (甲賀忍蛙)
    '-gorging',     // 一口吞形態 (古月鳥)
    '-gulping',     // 大口吞形態 (古月鳥)
    '-terastal',    // 太晶化專屬型態
    '-stellar'      // 星晶化專屬型態
];

// Minior 專屬規則：只保留 minior-red-meteor（非戰鬥狀態代表），其餘全部剔除
const MINIOR_KEEP = 'minior-red-meteor';
function isExcludedMinior(key) {
    return key.startsWith('minior-') && key !== MINIOR_KEEP;
}

function pruneData() {
    console.log("🧹 啟動本地資料瘦身與清理任務 (含 Mega X/Y 校準)...");

    // ==========================================
    // 1. 清理數值資料 (gen1.json ~ gen9.json)
    // ==========================================
    console.log("\n📊 正在清理數值資料...");
    for (let i = 1; i <= 9; i++) {
        const filePath = path.join(STATS_DIR, `gen${i}.json`);

        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            const statsList = JSON.parse(rawData);

            const originalLength = statsList.length;
            // 使用 includes 確保只要字串內包含該後綴就剔除
            // 另外：minior 只保留 minior-red-meteor 一筆
            const filteredList = statsList.filter(p =>
                !EXCLUDED.some(ex => p.key.includes(ex)) && !isExcludedMinior(p.key)
            );

            const removedCount = originalLength - filteredList.length;
            fs.writeFileSync(filePath, JSON.stringify(filteredList, null, 2));
            console.log(` ✅ gen${i}.json: 移除了 ${removedCount} 筆暫時狀態資料 (剩餘 ${filteredList.length} 筆)`);
        }
    }

    // ==========================================
    // 2. 清理多語系名稱字典 (pokemon-names.json)
    // ==========================================
    console.log("\n🌐 正在清理多語系名稱字典...");
    LANGUAGES.forEach(lang => {
        const filePath = path.join(LOCALES_DIR, lang, 'pokemon-names.json');

        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            const nameDict = JSON.parse(rawData);

            const originalLength = Object.keys(nameDict).length;
            const filteredDict = {};

            for (const [key, value] of Object.entries(nameDict)) {
                // 同樣使用 includes 嚴格過濾；另外 minior 只保留 minior-red-meteor
                if (!EXCLUDED.some(ex => key.includes(ex)) && !isExcludedMinior(key)) {
                    filteredDict[key] = value;
                }
            }

            const removedCount = originalLength - Object.keys(filteredDict).length;
            fs.writeFileSync(filePath, JSON.stringify(filteredDict, null, 2));
            console.log(` ✅ ${lang} 字典: 移除了 ${removedCount} 筆暫時狀態資料 (剩餘 ${Object.keys(filteredDict).length} 筆)`);
        }
    });

    console.log("\n🎉 Mega X 與 Mega Y 等型態，以及多餘的 Minior 變體已全數清除完畢！");
}

pruneData();