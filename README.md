# My Poke Calc

繁體中文的寶可夢個體值計算器。目前第一版介面使用第九世代種族值與現代 IV 規則，可依全國圖鑑編號、繁中名稱或英文名稱搜尋寶可夢，並根據等級、性格、實際能力值與 EV 逆推出 IV 範圍。

## 功能

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

```bash
npm run data:update
```

這會重新抓取名稱與種族值資料，再執行型態清理。資料來源為 [PokeAPI](https://pokeapi.co/)。

## 目前範圍

第一版 UI 只使用 `gen9.json` 與 Gen 3–9 的現代 IV 公式。Gen 1 DV 引擎已有獨立測試，但尚未接入畫面；Gen 2 DV、未知 EV、極限特訓、歷史紀錄、多語系切換與 PWA 留待後續版本。

更多細節請參閱 [IV 計算引擎：支援範圍與限制](docs/iv-calculator.md)。
