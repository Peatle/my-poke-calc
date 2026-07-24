import { useCallback, useEffect, useRef } from 'react'

interface NumberInputProps {
  ariaLabel: string
  value: string
  min: number
  max?: number
  id?: string
  className?: string
  describedBy?: string
  disabled?: boolean
  invalid?: boolean
  placeholder?: string
  onChange: (value: string) => void
}

export function NumberInput({
  ariaLabel,
  value,
  min,
  max,
  id,
  className = '',
  describedBy,
  disabled = false,
  invalid = false,
  placeholder,
  onChange,
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const changeBy = useCallback(
    (amount: number) => {
      const currentValue = Number(value)
      const nextValue =
        value.trim() === '' || !Number.isFinite(currentValue)
          ? min
          : currentValue + amount
      const clampedValue = Math.min(
        max ?? Number.POSITIVE_INFINITY,
        Math.max(min, nextValue),
      )
      onChange(String(clampedValue))
    },
    [max, min, onChange, value],
  )

  useEffect(() => {
    const input = inputRef.current
    if (!input) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      if (document.activeElement !== input || event.deltaY === 0) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      changeBy(event.deltaY < 0 ? 1 : -1)
    }

    input.addEventListener('wheel', handleWheel, { passive: false })
    return () => input.removeEventListener('wheel', handleWheel)
  }, [changeBy])

  return (
    <div className={`number-input-wrap ${className}`}>
      <input
        aria-describedby={describedBy}
        aria-invalid={invalid}
        aria-label={ariaLabel}
        className="number-input"
        disabled={disabled}
        id={id}
        inputMode="numeric"
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        ref={inputRef}
        step="1"
        type="number"
        value={value}
      />
      <div className="number-stepper" aria-hidden={disabled}>
        <button
          aria-label={`${ariaLabel}減少`}
          className="number-stepper-button"
          disabled={disabled}
          onClick={() => changeBy(-1)}
          tabIndex={disabled ? -1 : 0}
          type="button"
        >
          −
        </button>
        <button
          aria-label={`${ariaLabel}增加`}
          className="number-stepper-button"
          disabled={disabled}
          onClick={() => changeBy(1)}
          tabIndex={disabled ? -1 : 0}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  )
}
