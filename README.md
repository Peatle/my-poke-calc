# My Poke Calc

繁體中文的寶可夢個體值計算器。介面支援 Gen 8（劍／盾／BDSP）與 Gen 9（朱／紫），可依全國圖鑑編號、繁中名稱或英文名稱搜尋寶可夢，並根據所選世代的種族值、等級、性格、實際能力值與 EV 逆推出 IV 範圍。

## 功能

- 可在 Gen 8 與 Gen 9 之間切換，預設使用 Gen 9
- 搜尋目錄、種族值與 IV 計算會同步使用目前選取世代的資料
- 保留克雷色利亞、蒼響與藏瑪然特等寶可夢的歷史種族值差異
- 依全國圖鑑編號排序，支援 `25`、`025`、`#0025` 等編號搜尋
- 支援繁中、英文與內部 key 搜尋
- 收錄 25 種性格及六項能力倍率
- 一次計算 HP、攻擊、防禦、特攻、特防與速度
- 顯示 IV 單值、範圍、滿值「最棒」及無符合結果
- 驗證等級、單項 EV 與 EV 總和
- 特別處理脫殼忍者固定 HP 規則
- 手機與桌面響應式介面

## 開發環境

- Node.js 24
- React 19
- Vite 6
- TypeScript 6
- Tailwind CSS 3
- Vitest 3

## 安裝與執行

```bash
npm install
npm run dev
```

Vite 啟動後會在終端機顯示本機網址，通常為：

```text
http://localhost:5173/my-poke-calc/
```

## 驗證指令

```bash
# 執行全部測試
npm test -- --run

# ESLint
npm run lint

# TypeScript 與正式版建置
npm run build
```

## 資料更新

更新全部世代與名稱資料：

```bash
npm run data:update
```

這會重新抓取名稱與種族值資料，再執行型態清理。資料來源為 [PokéAPI](https://pokeapi.co/)。

只抓取及清理指定世代時，可以將世代編號傳給資料腳本：

```bash
npm run data:fetch-stats -- --gen 8
npm run data:prune -- --gen 8
```

定向清理模式不會改寫其他世代或共用的多語系名稱字典。

## 目前範圍

### Gen 8（劍／盾／BDSP）

- 使用第三至第九世代共用的一般現代 IV 公式。
- 資料上限為 `#0898 蕾冠王`，並使用 Gen 8 當時的歷史種族值。
- 包含伽勒爾型態、劍／盾 DLC 寶可夢及蕾冠王的騎乘型態。
- 不支援《寶可夢傳說 阿爾宙斯》的奮鬥等級與能力值系統。
- 不判斷寶可夢能否在劍、盾、晶燦鑽石或明亮珍珠的特定版本中取得。

### Gen 9（朱／紫）

- 使用目前的 Gen 9 搜尋目錄、種族值與一般現代 IV 公式。

計算時應輸入狀態頁顯示的一般能力值，不應輸入極巨化期間的 HP 或對戰中的暫時能力變化。

Gen 1 DV 引擎已有獨立測試但尚未接入畫面；Gen 2 DV、未知 EV、極限特訓、歷史紀錄、多語系切換與 PWA 留待後續版本。

更多細節請參閱 [IV 計算引擎：支援範圍與限制](docs/iv-calculator.md)；本次功能的設計與驗收紀錄請參閱 [Gen 8 數值計算支援計畫](docs/gen8-support-plan.md)。

## 資料來源與免責聲明

資料來源：[PokéAPI](https://pokeapi.co/)。

計算結果僅供參考，請以遊戲內實際資料為準。

本網站為非官方、非商業性的粉絲製作資訊工具，與任天堂、Game Freak、Creatures Inc. 及 The Pokémon Company 無任何關聯。寶可夢（Pokémon）及相關商標與內容之權利歸其各自權利人所有。
