'use client'

import { useState } from 'react'
import TextInput from '@/src/components/inputs/TextInput'
import PhoneInput from '@/src/components/inputs/PhoneInput'
import OTPInput from '@/src/components/inputs/OTPInput'
import DateInput from '@/src/components/inputs/DateInput'
import Slider from '@/src/components/inputs/Slider'
import OptionButtonGroup from '@/src/components/inputs/OptionButtonGroup'

export type InputType = 'text' | 'phone' | 'otp' | 'date' | 'slider' | 'options'

export interface InputAreaProps {
  type: InputType
  onSubmit: (value: string | number | Date | null) => void
  inputProps?: Record<string, unknown>
}

export default function InputArea({ type, onSubmit, inputProps = {} }: InputAreaProps) {
  const [textValue, setTextValue] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [dateValue, setDateValue] = useState<Date | null>(null)
  const [sliderValue, setSliderValue] = useState<number>(
    typeof inputProps.defaultValue === 'number'
      ? inputProps.defaultValue
      : typeof inputProps.min === 'number'
        ? inputProps.min
        : 1
  )

  switch (type) {
    case 'text':
      return (
        <TextInput
          value={textValue}
          onChange={setTextValue}
          onSubmit={onSubmit}
          placeholder={typeof inputProps.placeholder === 'string' ? inputProps.placeholder : undefined}
          autoFocus
        />
      )

    case 'phone':
      return (
        <PhoneInput
          value={phoneValue}
          onChange={setPhoneValue}
          onSubmit={onSubmit}
          error={typeof inputProps.error === 'string' ? inputProps.error : undefined}
        />
      )

    case 'otp':
      return (
        <OTPInput
          onComplete={onSubmit}
          onResend={typeof inputProps.onResend === 'function' ? (inputProps.onResend as () => void) : undefined}
          error={typeof inputProps.error === 'string' ? inputProps.error : undefined}
        />
      )

    case 'date':
      return (
        <DateInput
          value={dateValue}
          onChange={setDateValue}
          onSubmit={onSubmit}
          onSkip={inputProps.canSkip ? () => {} : undefined}
          minDate={inputProps.minDate instanceof Date ? inputProps.minDate : new Date()}
          placeholder={typeof inputProps.placeholder === 'string' ? inputProps.placeholder : undefined}
        />
      )

    case 'slider':
      return (
        <Slider
          min={typeof inputProps.min === 'number' ? inputProps.min : 1}
          max={typeof inputProps.max === 'number' ? inputProps.max : 10}
          step={typeof inputProps.step === 'number' ? inputProps.step : 1}
          value={sliderValue}
          onChange={setSliderValue}
          onSubmit={onSubmit}
          formatLabel={typeof inputProps.formatLabel === 'function' ? (inputProps.formatLabel as (v: number) => string) : undefined}
        />
      )

    case 'options':
      return (
        <OptionButtonGroup
          options={Array.isArray(inputProps.options) ? (inputProps.options as Array<{ label: string; value: string }>) : []}
          onSelect={onSubmit}
          ariaLabel={typeof inputProps.ariaLabel === 'string' ? inputProps.ariaLabel : 'Options'}
        />
      )
  }
}
