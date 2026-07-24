import type { NatureModifier, StatName } from '../types/pokemon'

export type BattleStatName = Exclude<StatName, 'hp'>

export interface Nature {
  id: string
  zhName: string
  enName: string
  increased: BattleStatName | null
  decreased: BattleStatName | null
}

export const NATURES: readonly Nature[] = [
  {
    id: 'hardy',
    zhName: '勤奮',
    enName: 'Hardy',
    increased: null,
    decreased: null,
  },
  {
    id: 'lonely',
    zhName: '怕寂寞',
    enName: 'Lonely',
    increased: 'attack',
    decreased: 'defense',
  },
  {
    id: 'brave',
    zhName: '勇敢',
    enName: 'Brave',
    increased: 'attack',
    decreased: 'speed',
  },
  {
    id: 'adamant',
    zhName: '固執',
    enName: 'Adamant',
    increased: 'attack',
    decreased: 'special-attack',
  },
  {
    id: 'naughty',
    zhName: '頑皮',
    enName: 'Naughty',
    increased: 'attack',
    decreased: 'special-defense',
  },
  {
    id: 'bold',
    zhName: '大膽',
    enName: 'Bold',
    increased: 'defense',
    decreased: 'attack',
  },
  {
    id: 'docile',
    zhName: '坦率',
    enName: 'Docile',
    increased: null,
    decreased: null,
  },
  {
    id: 'relaxed',
    zhName: '悠閒',
    enName: 'Relaxed',
    increased: 'defense',
    decreased: 'speed',
  },
  {
    id: 'impish',
    zhName: '淘氣',
    enName: 'Impish',
    increased: 'defense',
    decreased: 'special-attack',
  },
  {
    id: 'lax',
    zhName: '樂天',
    enName: 'Lax',
    increased: 'defense',
    decreased: 'special-defense',
  },
  {
    id: 'timid',
    zhName: '膽小',
    enName: 'Timid',
    increased: 'speed',
    decreased: 'attack',
  },
  {
    id: 'hasty',
    zhName: '急躁',
    enName: 'Hasty',
    increased: 'speed',
    decreased: 'defense',
  },
  {
    id: 'serious',
    zhName: '認真',
    enName: 'Serious',
    increased: null,
    decreased: null,
  },
  {
    id: 'jolly',
    zhName: '爽朗',
    enName: 'Jolly',
    increased: 'speed',
    decreased: 'special-attack',
  },
  {
    id: 'naive',
    zhName: '天真',
    enName: 'Naive',
    increased: 'speed',
    decreased: 'special-defense',
  },
  {
    id: 'modest',
    zhName: '內斂',
    enName: 'Modest',
    increased: 'special-attack',
    decreased: 'attack',
  },
  {
    id: 'mild',
    zhName: '慢吞吞',
    enName: 'Mild',
    increased: 'special-attack',
    decreased: 'defense',
  },
  {
    id: 'quiet',
    zhName: '冷靜',
    enName: 'Quiet',
    increased: 'special-attack',
    decreased: 'speed',
  },
  {
    id: 'bashful',
    zhName: '害羞',
    enName: 'Bashful',
    increased: null,
    decreased: null,
  },
  {
    id: 'rash',
    zhName: '馬虎',
    enName: 'Rash',
    increased: 'special-attack',
    decreased: 'special-defense',
  },
  {
    id: 'calm',
    zhName: '溫和',
    enName: 'Calm',
    increased: 'special-defense',
    decreased: 'attack',
  },
  {
    id: 'gentle',
    zhName: '溫順',
    enName: 'Gentle',
    increased: 'special-defense',
    decreased: 'defense',
  },
  {
    id: 'sassy',
    zhName: '自大',
    enName: 'Sassy',
    increased: 'special-defense',
    decreased: 'speed',
  },
  {
    id: 'careful',
    zhName: '慎重',
    enName: 'Careful',
    increased: 'special-defense',
    decreased: 'special-attack',
  },
  {
    id: 'quirky',
    zhName: '浮躁',
    enName: 'Quirky',
    increased: null,
    decreased: null,
  },
]

export function getNatureModifier(
  nature: Nature,
  stat: StatName,
): NatureModifier {
  if (stat === 'hp') {
    return 1
  }

  if (nature.increased === stat) {
    return 1.1
  }

  if (nature.decreased === stat) {
    return 0.9
  }

  return 1
}
