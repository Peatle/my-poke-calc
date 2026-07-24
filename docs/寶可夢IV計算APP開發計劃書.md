**第一階段：環境搭建與專案初始化**   
目標：建立一個現代化的前端開發環境，並確保能自動部署到 GitHub Pages。  
• **技術選型：** 使用 **Vite \+ TypeScript \+ Tailwind CSS**。  
• **專案初始化：** \* 使用 npm create vite@latest my-poke-calc \-- \--template react-ts (或是您喜歡的框架)。  
	• 安裝 Tailwind CSS 並配置 tailwind.config.js。  
• **GitHub Pages 自動化：**  
	• 在 GitHub 建立 Repo。  
	• 配置 **GitHub Actions** (.github/workflows/deploy.yml)，設定當您 push 代碼時，自動編譯並部署至 GitHub Pages。  
	• **Antigravity 提示：** 您可以直接要求 AI 幫您寫這份 deploy.yml。

**第二階段：數據準備與 i18n 結構**   
目標：取得第九世代（朱／紫）的正確數據，並建立多語系框架。  
• **數據抓取腳本：** \* 撰寫一個 Node.js 腳本，利用 fetch 從 **PokeAPI** 抓取第 9 代寶可夢的種族值（Base Stats）與譯名。  
	• **關鍵：** 抓取 names 陣列中的 language: "zh-Hant" (繁中) 與 language: "en" (英文)。  
• **i18n 配置：**  
	• 安裝 i18next 與 react-i18next。  
	• 建立語系檔結構：locales/zh-Hant.json 與 locales/en.json。  
• **數據存儲：** 將抓取好的資料存成 src/data/gen9.json，並在開發時使用 Vite 的動態匯入。

**第三階段：核心運算邏輯與 TypeScript 模型**   
目標：實作精準的 IV 計算公式，並確保強型別檢查。  
• **定義介面 (Interface)：**  
	• 定義 IPokemon, IStats, ILocalizedName 等介面。  
• **IV 計算引擎：**  
	• 實作個體值（IV）逆推公式。由於能力值是取整數，IV 通常是一個範圍（Range）。  
	• **公式參考：**  
$$Stat \= \\lfloor (\\frac{2 \\times Base \+ IV \+ \\lfloor \\frac{EV}{4} \\rfloor \\times Level}{100} \+ 5\) \\times Nature \\rfloor$$  
(註：HP 公式略有不同，需分開處理)  
• **單元測試：** 利用 **Vitest** 撰寫測試案例，確保計算結果與遊戲內數值完全吻合。

**第四階段：響應式 UI 開發**   
目標：使用 Tailwind CSS 打造在手機上也能流暢操作的介面。  
• **搜尋組件：** 實作一個支援中英文搜尋的自動完成（Autocomplete）輸入框。  
• **數值輸入面板：**  
	• 設計等級、性格（Nature）選單。  
	• 六項數值與 EV 值的輸入欄位（建議使用滾輪或加減號按鈕，方便手機操作）。  
• **結果顯示：** \* 即時顯示計算出的 IV 範圍（例如：28\~31）。  
	• 使用顏色標註（如 31 為紅色/金色標記「最棒」）。

**第五階段：本地儲存與持久化**   
目標：讓用戶能保存他們辛苦計算出來的寶可夢。  
• **LocalStorage 整合：**  
	• 撰寫 useLocalStorage Hook，將用戶的寶可夢列表序列化為 JSON 存入瀏覽器。  
• **歷史紀錄清單：** \* 建立一個側邊欄或底部頁籤，顯示已儲存的寶可夢，並支援點擊重新載入數據或刪除。  
• **資料匯出/匯入 (選配)：** \* 實作一個簡單的 JSON 匯出功能，方便用戶在更換設備時遷移資料。

🚀 **階段性成果清單 (Checklist)**  
1\. \[ \] **V1.0 (MVP):** 基礎網頁、Gen 9 數據、手動輸入數值、顯示計算結果。  
2\. \[ \] **V1.1:** 增加繁中/英文切換、LocalStorage 儲存功能。  
3\. \[ \] **V1.2:** 優化 UI/UX，增加性格與努力值（EV）的快速填寫預設值。

💡 **資深工程師的開發小技巧**  
• **利用 AI Credits：** 在第二階段抓取 PokeAPI 時，如果發現 API 回傳格式太雜，直接將一部分回傳範例丟給 **Antigravity** 並說：「請幫我寫一個 TypeScript 轉換函數，將這個 API 結構轉成我定義的輕量化 IPokemon 格式。」 這能省下大量手動對欄位的時間。  
• **PWA 擴充：** 在專案後期，您可以加入 vite-plugin-pwa。這樣您的 GitHub Pages 網頁在手機上開啟時，用戶可以直接「加到主畫面」，運作起來就像原生 App 一樣。

