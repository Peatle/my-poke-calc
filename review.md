# Code Review: 第一世代 DV 計算引擎與型別定義

這是一份針對 `my-poke-calc` 專案近期變更的程式碼審查報告。

## 📋 變更概覽
本次變更主要新增了寶可夢核心型別定義、第一世代 DV (Determinant Values) 計算引擎以及對應的單元測試，為計算器的核心功能奠定了穩健的基礎。

---

## 🔍 詳細審查

### 1. 型別定義 (`src/types/pokemon.ts`) - **優良 (Excellent)**
* **精確性**：`IBaseStats` 介面正確處理了不同世代間的屬性差異。利用 TypeScript 的可選屬性 (`?`) 區分 Gen 1 的 `special` 與 Gen 2+ 的 `special-attack`/`special-defense` 是非常直覺且具備擴展性的做法。
* **清晰度**：`StatSystem` 的定義明確區分了 DV 與 IV 兩種不同的數值體系。

### 2. 計算引擎 (`src/utils/calcEngine.ts`) - **良好 (Good)**
* **邏輯架構**：使用了純函式設計，讓計算邏輯與 UI 徹底分離，便於測試與重複使用。
* **HP DV 推導**：`calculateTrueHpDV` 函式的位元加總邏輯（8, 4, 2, 1）完全符合第一/二世代的遊戲機制。

#### ⚠️ 關鍵修正建議：Stat Exp 計算精確度
在 `calculateDVRange` 中，目前的 `statExpBonus` 公式存在一個極細微的邊界問題：

**問題描述：**
```typescript
const statExpBonus = Math.floor(Math.ceil(Math.sqrt(statExp)) / 4);
```
在第一世代中，Stat Exp 的上限為 `65535`。
- **Gameboy 實際行為**：由於整數運算限制，開根號結果最大為 `255`。`floor(255/4) = 63`。
- **JavaScript 行為**：`Math.sqrt(65535)` 約為 `255.998`，`Math.ceil` 後變為 `256`。`256 / 4 = 64`。
這會導致滿努力值的寶可夢在計算時出現 1 點能力值的偏差。

**建議修正：**
```typescript
// 限制開根號結果最高為 255，還原原始硬體運算機制
const rootStatExp = Math.min(255, Math.ceil(Math.sqrt(statExp)));
const statExpBonus = Math.floor(rootStatExp / 4);
```

### 3. 單元測試 (`src/utils/calcEngine.test.ts`) - **優良 (Excellent)**
* **覆蓋面**：測試案例涵蓋了一般能力值、HP 特殊公式、不可能的極端數值（邊界測試）。
* **機制驗證**：特別針對「低等級時會有多個可能 DV」的特性進行了斷言，證明計算引擎能正確反映遊戲內的數值模糊性。

---

## ✅ 審查結論
程式碼品質非常高，邏輯清晰且具備良好的測試保護。建議套用上述關於 **Stat Exp 上限保護** 的修正後，即可進行 Commit 與後續整合。
