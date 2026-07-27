// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import {
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

async function selectPokemon(query: string, optionName: RegExp) {
  const user = userEvent.setup()
  const searchInput = screen.getByRole('combobox', { name: '寶可夢' })
  await user.clear(searchInput)
  await user.type(searchInput, query)
  await user.click(screen.getByRole('option', { name: optionName }))
  return user
}

describe('Gen 8／Gen 9 IV 計算器 UI', () => {
  it('預設使用 Gen 9 並顯示對應 Header', () => {
    render(<App />)

    expect(screen.getByRole('combobox', { name: '遊戲世代' })).toHaveValue(
      'gen9',
    )
    expect(screen.getByText('GEN 9 · IV CALCULATOR')).toBeInTheDocument()
  })

  it('空白搜尋不顯示建議，輸入文字後才顯示結果', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('spinbutton', { name: '等級' })).toHaveValue(50)
    expect(screen.getByRole('combobox', { name: '性格' })).toHaveValue(
      'serious',
    )

    const searchInput = screen.getByRole('combobox', { name: '寶可夢' })
    await user.click(searchInput)
    expect(searchInput).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.type(searchInput, '妙蛙種子')
    expect(searchInput).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(
      screen.getByRole('option', {
        name: /#0001.*妙蛙種子.*Bulbasaur/i,
      }),
    ).toBeInTheDocument()

    await user.clear(searchInput)
    expect(searchInput).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('支援英文搜尋與鍵盤 Enter 選取', async () => {
    const user = userEvent.setup()
    render(<App />)

    const searchInput = screen.getByRole('combobox', { name: '寶可夢' })
    await user.type(searchInput, 'bulbasaur')
    await user.keyboard('{Enter}')

    expect(screen.getByText('#0001')).toBeInTheDocument()
    expect(screen.getByText('妙蛙種子')).toBeInTheDocument()
  })

  it('支援帶前導零的圖鑑編號搜尋', async () => {
    render(<App />)
    await selectPokemon('#0025', /#0025.*皮卡丘.*Pikachu/i)

    expect(screen.getByText('#0025')).toBeInTheDocument()
    expect(screen.getByText('皮卡丘')).toBeInTheDocument()
  })

  it('可計算單一 IV 31 並顯示最棒', async () => {
    render(<App />)
    const user = await selectPokemon('妙蛙種子', /#0001.*妙蛙種子.*Bulbasaur/i)

    const levelInput = screen.getByRole('spinbutton', { name: '等級' })
    await user.clear(levelInput)
    await user.type(levelInput, '100')
    await user.type(screen.getByLabelText('攻擊實際能力值'), '134')

    expect(screen.getByText('最棒')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
  })

  it('套用完整性格並顯示無符合結果', async () => {
    render(<App />)
    const user = await selectPokemon('妙蛙種子', /#0001.*妙蛙種子.*Bulbasaur/i)

    await user.selectOptions(screen.getByRole('combobox', { name: '性格' }), [
      'adamant',
    ])
    expect(screen.getByText('↑ 1.1')).toBeInTheDocument()
    expect(screen.getByText('↓ 0.9')).toBeInTheDocument()

    await user.type(screen.getByLabelText('攻擊實際能力值'), '999')
    expect(
      screen.getByText('無符合結果，請檢查輸入'),
    ).toBeInTheDocument()
  })

  it('EV 總和超過 510 時停止計算並顯示提示', async () => {
    render(<App />)
    const user = await selectPokemon('妙蛙種子', /#0001.*妙蛙種子.*Bulbasaur/i)

    for (const label of ['HPEV', '攻擊EV', '防禦EV']) {
      const input = screen.getByLabelText(label)
      await user.clear(input)
      await user.type(input, '252')
    }
    await user.type(screen.getByLabelText('HP實際能力值'), '120')

    expect(screen.getByText('EV 合計 756 / 510')).toBeInTheDocument()
    expect(screen.getByText('EV 總和超過 510')).toBeInTheDocument()
  })

  it('可用無外框的加減控制調整數值並遵守上下限', async () => {
    render(<App />)
    const user = await selectPokemon('妙蛙種子', /#0001.*妙蛙種子.*Bulbasaur/i)
    const attackEv = screen.getByLabelText('攻擊EV')

    await user.click(screen.getByRole('button', { name: '攻擊EV減少' }))
    expect(attackEv).toHaveValue(0)

    await user.click(screen.getByRole('button', { name: '攻擊EV增加' }))
    expect(attackEv).toHaveValue(1)

    await user.clear(attackEv)
    await user.type(attackEv, '252')
    await user.click(screen.getByRole('button', { name: '攻擊EV增加' }))
    expect(attackEv).toHaveValue(252)
  })

  it('只有輸入框取得焦點時，滾輪才會調整數值', async () => {
    const parentWheelHandler = vi.fn()
    render(
      <div onWheel={parentWheelHandler}>
        <App />
      </div>,
    )
    await selectPokemon('妙蛙種子', /#0001.*妙蛙種子.*Bulbasaur/)

    const attackEv = screen.getByLabelText('攻擊EV')

    const unfocusedWheel = createEvent.wheel(attackEv, {
      cancelable: true,
      deltaY: -100,
    })
    fireEvent(attackEv, unfocusedWheel)
    expect(attackEv).toHaveValue(0)
    expect(unfocusedWheel.defaultPrevented).toBe(false)
    expect(parentWheelHandler).toHaveBeenCalledTimes(1)

    attackEv.focus()
    const focusedWheel = createEvent.wheel(attackEv, {
      cancelable: true,
      deltaY: -100,
    })
    fireEvent(attackEv, focusedWheel)
    expect(attackEv).toHaveValue(1)
    expect(focusedWheel.defaultPrevented).toBe(true)
    expect(parentWheelHandler).toHaveBeenCalledTimes(1)

    fireEvent.wheel(attackEv, { deltaY: 100 })
    expect(attackEv).toHaveValue(0)
    expect(parentWheelHandler).toHaveBeenCalledTimes(1)

    attackEv.blur()
    fireEvent.wheel(attackEv, { deltaY: -100 })
    expect(attackEv).toHaveValue(0)
    expect(parentWheelHandler).toHaveBeenCalledTimes(2)
  })

  it('拒絕不合法的等級與單項 EV', async () => {
    render(<App />)
    const user = await selectPokemon('妙蛙種子', /#0001.*妙蛙種子.*Bulbasaur/i)

    const levelInput = screen.getByRole('spinbutton', { name: '等級' })
    await user.clear(levelInput)
    await user.type(levelInput, '101')
    expect(screen.getByText('請輸入 1–100 的整數')).toBeInTheDocument()

    await user.clear(levelInput)
    await user.type(levelInput, '50')
    const attackEv = screen.getByLabelText('攻擊EV')
    await user.clear(attackEv)
    await user.type(attackEv, '253')
    await user.type(screen.getByLabelText('攻擊實際能力值'), '70')

    expect(screen.getByText('EV 須為 0–252 整數')).toBeInTheDocument()
  })

  it('脫殼忍者 HP 顯示固定規則，其他能力仍可輸入', async () => {
    render(<App />)
    await selectPokemon('292', /#0292.*脫殼忍者.*Shedinja/i)

    expect(screen.getByText('HP 固定為 1')).toBeInTheDocument()
    expect(screen.getByText('無法逆推 IV')).toBeInTheDocument()
    expect(screen.getByLabelText('HP實際能力值')).toBeDisabled()
    expect(screen.getByLabelText('攻擊實際能力值')).toBeEnabled()
  })

  it('切換 Gen 8 會更新 Header、搜尋資料與歷史種族值', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(
      screen.getByRole('combobox', { name: '遊戲世代' }),
      'gen8',
    )

    expect(screen.getByText('GEN 8 · IV CALCULATOR')).toBeInTheDocument()
    expect(screen.queryByText('GEN 9 · IV CALCULATOR')).not.toBeInTheDocument()

    await selectPokemon('克雷色利亞', /#0488.*克雷色利亞.*Cresselia/i)

    const defenseRow = screen
      .getByLabelText('防禦實際能力值')
      .closest('.stat-row')
    const specialDefenseRow = screen
      .getByLabelText('特防實際能力值')
      .closest('.stat-row')

    expect(defenseRow).not.toBeNull()
    expect(specialDefenseRow).not.toBeNull()
    expect(within(defenseRow as HTMLElement).getAllByText('120')).toHaveLength(2)
    expect(
      within(specialDefenseRow as HTMLElement).getAllByText('130'),
    ).toHaveLength(2)

    const levelInput = screen.getByRole('spinbutton', { name: '等級' })
    await user.clear(levelInput)
    await user.type(levelInput, '100')
    await user.type(screen.getByLabelText('防禦實際能力值'), '276')
    expect(within(defenseRow as HTMLElement).getByText('31')).toBeInTheDocument()
    expect(
      within(defenseRow as HTMLElement).getByText('最棒'),
    ).toBeInTheDocument()
  })

  it('切換世代會清除相依欄位，但保留等級與性格', async () => {
    const user = userEvent.setup()
    render(<App />)
    await selectPokemon('妙蛙種子', /#0001.*妙蛙種子.*Bulbasaur/i)

    const levelInput = screen.getByRole('spinbutton', { name: '等級' })
    await user.clear(levelInput)
    await user.type(levelInput, '75')
    await user.selectOptions(
      screen.getByRole('combobox', { name: '性格' }),
      'adamant',
    )
    await user.type(screen.getByLabelText('攻擊實際能力值'), '100')
    await user.clear(screen.getByLabelText('攻擊EV'))
    await user.type(screen.getByLabelText('攻擊EV'), '252')

    await user.selectOptions(
      screen.getByRole('combobox', { name: '遊戲世代' }),
      'gen8',
    )

    expect(screen.getByRole('combobox', { name: '寶可夢' })).toHaveValue('')
    expect(screen.getByText('請先搜尋並選擇一隻寶可夢')).toBeInTheDocument()
    expect(levelInput).toHaveValue(75)
    expect(screen.getByRole('combobox', { name: '性格' })).toHaveValue(
      'adamant',
    )
    expect(screen.getByLabelText('攻擊實際能力值')).toHaveValue(null)
    expect(screen.getByLabelText('攻擊EV')).toHaveValue(0)
  })

  it('世代切換會關閉舊搜尋結果，重設全部則保留目前世代', async () => {
    const user = userEvent.setup()
    render(<App />)

    const searchInput = screen.getByRole('combobox', { name: '寶可夢' })
    await user.type(searchInput, '899')
    expect(screen.getByRole('option', { name: /#0899.*詭角鹿/i })).toBeInTheDocument()

    await user.selectOptions(
      screen.getByRole('combobox', { name: '遊戲世代' }),
      'gen8',
    )

    const resetSearchInput = screen.getByRole('combobox', { name: '寶可夢' })
    expect(resetSearchInput).toHaveValue('')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.type(resetSearchInput, '899')
    expect(screen.getByText('找不到符合的寶可夢')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '重設全部' }))
    expect(screen.getByRole('combobox', { name: '遊戲世代' })).toHaveValue(
      'gen8',
    )
  })
})
