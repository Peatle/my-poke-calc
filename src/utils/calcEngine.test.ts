/**
 * src/utils/calcEngine.test.ts
 * 測試第一世代 DV 計算引擎
 */
import { describe, it, expect } from 'vitest';
import { calculateDVRange, calculateTrueHpDV } from './calcEngine';

describe('第一世代 DV 計算引擎 (Gen 1 DV Engine)', () => {

    describe('calculateDVRange: 非 HP 能力值計算', () => {
        it('應能精準算出 50 級夢幻 (種族值 100) 能力值為 120 時，DV 為 15', () => {
            // 夢幻基底 100，無 Stat Exp，50 級，能力值 120
            const dvs = calculateDVRange(120, 100, 50, false, 0);
            expect(dvs).toEqual([15]); // 絕對精準，只有 15 吻合
        });

        it('低等級時應回傳多個可能的 DV 區間', () => {
            // 小火龍 (攻擊基底 52)，5 級，剛抓到 (Stat Exp 0)，能力值 11
            const dvs = calculateDVRange(11, 52, 5, false, 0);
            // 因為等級太低，Math.floor 導致 DV 10~15 算出來的能力值都是 11
            expect(dvs.length).toBeGreaterThan(1);
            expect(dvs).toContain(15);
            expect(dvs).toContain(10);
        });

        it('輸入不可能的極端數值時，應回傳空陣列', () => {
            // 50 級夢幻不可能有 999 的能力值
            const dvs = calculateDVRange(999, 100, 50, false, 0);
            expect(dvs).toEqual([]);
        });

        it('應能正確處理滿基礎點數 (Stat Exp 65535) 的硬體限制，避免能力值溢算', () => {
            // 假設某寶可夢 100 級，種族值 100，目標數值 298 (滿 DV 15 + 滿努力值加成 63)
            // 核心公式： (100 + 15) * 2 + 63 = 293。 (293 * 100 / 100) + 5 = 298。
            // 若無限制 255，加成會變成 64，算出來的能力值會變 299，導致用 298 逆推會找不到 DV。
            const dvs = calculateDVRange(298, 100, 100, false, 65535);
            expect(dvs).toEqual([15]);
        });
    });

    describe('calculateDVRange: HP 能力值計算', () => {
        it('應能精準算出 50 級夢幻 (種族值 100) HP 為 175 時，DV 為 15', () => {
            // HP 算法不同，結果也不同
            const dvs = calculateDVRange(175, 100, 50, true, 0);
            expect(dvs).toEqual([15]);
        });
    });

    describe('calculateTrueHpDV: HP 個體值推導', () => {
        it('四項 DV 皆為奇數時，HP DV 應為滿值 15', () => {
            // 攻擊(8) + 防禦(4) + 速度(2) + 特殊(1) = 15
            const hpDV = calculateTrueHpDV(15, 15, 15, 15);
            expect(hpDV).toBe(15);
        });

        it('四項 DV 皆為偶數時，HP DV 應為 0', () => {
            const hpDV = calculateTrueHpDV(14, 14, 14, 14);
            expect(hpDV).toBe(0);
        });

        it('部分奇數時，應正確加總', () => {
            // 攻擊(15, 奇數 -> +8), 防禦(14, 偶數 -> +0), 速度(15, 奇數 -> +2), 特殊(14, 偶數 -> +0)
            // 預期 HP DV: 8 + 0 + 2 + 0 = 10
            const hpDV = calculateTrueHpDV(15, 14, 15, 14);
            expect(hpDV).toBe(10);
        });
    });

});