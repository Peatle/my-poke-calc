/**
 * src/utils/calcEngine.ts
 * * 寶可夢能力值與個體值 (DV/IV) 核心運算引擎
 */

// 這裡可以選擇性引入您定義的型別，例如 IBaseStats，但為了保持函式純粹，我們使用基本型別傳遞
// import { IBaseStats } from '../types/pokemon';

/**
 * 計算第一世代 (Gen 1) 寶可夢的可能 DV (Determinant Values) 區間
 * * @param targetStat 玩家輸入的遊戲內實際能力值
 * @param baseStat 該寶可夢的種族值 (Base Stat)
 * @param level 寶可夢等級 (1~100)
 * @param isHP 是否為 HP 項計算 (HP 公式與其他五維不同)
 * @param statExp 基礎點數 (Stat Experience)，預設為 0 (野生未鍛鍊狀態)
 * @returns 包含所有可能 DV 數值的陣列 (範圍 0~15)。若無可能值則回傳空陣列。
 */
export function calculateDVRange(
    targetStat: number,
    baseStat: number,
    level: number,
    isHP: boolean = false,
    statExp: number = 0
): number[] {
    const possibleDVs: number[] = [];

    // 計算第一世代 Stat Exp 的加成項
    // 公式：無條件捨去(無條件進位(√StatExp) / 4)
    // 限制開根號結果最高為 255，完美還原第一世代 Gameboy 原始硬體運算機制
    const rootStatExp = Math.min(255, Math.ceil(Math.sqrt(statExp)));
    const statExpBonus = Math.floor(rootStatExp / 4);

    // 遍歷所有可能的 DV (0 到 15)
    for (let dv = 0; dv <= 15; dv++) {
        let calculatedStat = 0;

        // 核心基底數值計算
        const coreValue = (baseStat + dv) * 2 + statExpBonus;

        // 根據是否為 HP 套用不同公式
        if (isHP) {
            calculatedStat = Math.floor((coreValue * level) / 100) + level + 10;
        } else {
            calculatedStat = Math.floor((coreValue * level) / 100) + 5;
        }

        // 若正向計算的結果與使用者輸入的目標數值吻合，即為可能的 DV
        if (calculatedStat === targetStat) {
            possibleDVs.push(dv);
        }
    }

    return possibleDVs;
}

/**
 * (進階處理) 驗證第一世代 HP DV 的合法性
 * 在第一/二世代中，HP 的 DV 是由攻擊、防禦、速度、特殊的 DV 奇偶數決定的。
 * * @param atkDV 攻擊 DV
 * @param defDV 防禦 DV
 * @param spdDV 速度 DV
 * @param spcDV 特殊 DV
 * @returns 絕對精確的 HP DV
 */
export function calculateTrueHpDV(atkDV: number, defDV: number, spdDV: number, spcDV: number): number {
    let hpDV = 0;
    if (atkDV % 2 !== 0) hpDV += 8;
    if (defDV % 2 !== 0) hpDV += 4;
    if (spdDV % 2 !== 0) hpDV += 2;
    if (spcDV % 2 !== 0) hpDV += 1;
    return hpDV;
}