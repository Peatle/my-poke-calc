// 定義數值系統：前兩代為 DV，後續為 IV
export type StatSystem = 'DV' | 'IV';

// 定義基礎能力值結構
// 為了相容 Gen 1 的特殊(special) 與 Gen 2+ 的特攻/特防，我們使用可選屬性 (?)
export interface IBaseStats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    special?: number;            // 僅 Gen 1 存在
    'special-attack'?: number;   // Gen 2 以後存在
    'special-defense'?: number;  // Gen 2 以後存在
}

// 定義從 genX.json 讀取出來的單筆寶可夢資料結構
export interface IPokemonData {
    id: number;
    key: string;       // 例如 "charmander" 或 "minior-red-meteor"
    stats: IBaseStats;
    system: StatSystem;
}

// 定義多語系字典檔的結構
export type INameDict = Record<string, string>;

// 定義 UI 顯示用的完整寶可夢介面 (結合了數值與翻譯名稱)
export interface IPokemonDisplay extends IPokemonData {
    displayName: string; // 從 INameDict 映射過來的在地化名稱
}