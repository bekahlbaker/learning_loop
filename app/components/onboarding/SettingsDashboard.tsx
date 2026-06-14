'use client'

import { useState } from 'react'
import SettingsField from '@/app/components/onboarding/SettingsField'
import Slider from '@/app/components/inputs/Slider'
import OptionButtonGroup from '@/app/components/inputs/OptionButtonGroup'
import DateInput from '@/app/components/inputs/DateInput'
import Button from '@/app/components/buttons/Button'
import en from '@/app/messages/en.json'

export interface SettingsValues {
  timeOfDay: string
  deadline: Date | null
  dailyTimeBudget: number
  daysPerWeek: number
  confidence: number
  restaurantExperience: string
  currentRole: string
  existingCertification: string
  reason: string
  learningStyle: string
}

const DEFAULTS: SettingsValues = {
  timeOfDay: 'afternoon',
  deadline: null,
  dailyTimeBudget: 15,
  daysPerWeek: 4,
  confidence: 5,
  restaurantExperience: 'less-than-a-year',
  currentRole: 'manager',
  existingCertification: 'yes',
  reason: 'want-to-learn',
  learningStyle: 'dive-straight-in',
}

export interface SettingsDashboardProps {
  initialValues?: Partial<SettingsValues>
  onSave: (values: SettingsValues) => void
}

export default function SettingsDashboard({ initialValues, onSave }: SettingsDashboardProps) {
  const [values, setValues] = useState<SettingsValues>({ ...DEFAULTS, ...initialValues })

  const set = <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const s = en.onboarding.steps
  const f = en.onboarding.settings.fields

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-900">{en.onboarding.settings.title}</h1>
        <p className="text-sm text-gray-500">{en.onboarding.settings.subtitle}</p>
      </div>

      <form
        aria-label="Onboarding settings"
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(values)
        }}
      >
        <SettingsField label={f.timeOfDay.label} description={f.timeOfDay.description}>
          <OptionButtonGroup
            ariaLabel={f.timeOfDay.label}
            options={[
              { label: s.timeOfDay.options.morning, value: 'morning' },
              { label: s.timeOfDay.options.afternoon, value: 'afternoon' },
              { label: s.timeOfDay.options.evening, value: 'evening' },
              { label: s.timeOfDay.options['no-preference'], value: 'no-preference' },
            ]}
            selected={values.timeOfDay}
            onSelect={(v) => set('timeOfDay', v)}
          />
        </SettingsField>

        <SettingsField label={f.deadline.label} description={f.deadline.description}>
          <DateInput
            value={values.deadline}
            onChange={(date) => set('deadline', date)}
            onSkip={() => set('deadline', null)}
            minDate={new Date()}
          />
        </SettingsField>

        <SettingsField label={f.dailyTimeBudget.label} description={f.dailyTimeBudget.description}>
          <Slider
            min={5}
            max={30}
            step={5}
            value={values.dailyTimeBudget}
            onChange={(v) => set('dailyTimeBudget', v)}
            formatLabel={(v) => `${v} min`}
          />
        </SettingsField>

        <SettingsField label={f.daysPerWeek.label} description={f.daysPerWeek.description}>
          <Slider
            min={1}
            max={7}
            step={1}
            value={values.daysPerWeek}
            onChange={(v) => set('daysPerWeek', v)}
            formatLabel={(v) => `${v} day${v > 1 ? 's' : ''}`}
          />
        </SettingsField>

        <SettingsField label={f.confidence.label} description={f.confidence.description}>
          <Slider
            min={1}
            max={10}
            step={1}
            value={values.confidence}
            onChange={(v) => set('confidence', v)}
            formatLabel={(v) => String(v)}
          />
        </SettingsField>

        <SettingsField label={f.experience.label} description={f.experience.description}>
          <OptionButtonGroup
            ariaLabel={f.experience.label}
            options={[
              { label: s.experience.options.never, value: 'never' },
              { label: s.experience.options['less-than-a-year'], value: 'less-than-a-year' },
              { label: s.experience.options['1-3-years'], value: '1-3-years' },
              { label: s.experience.options['3-plus-years'], value: '3-plus-years' },
            ]}
            selected={values.restaurantExperience}
            onSelect={(v) => set('restaurantExperience', v)}
          />
        </SettingsField>

        <SettingsField label={f.currentRole.label} description={f.currentRole.description}>
          <OptionButtonGroup
            ariaLabel={f.currentRole.label}
            options={[
              { label: s.currentRole.options.server, value: 'server' },
              { label: s.currentRole.options['cook-or-prep-cook'], value: 'cook-or-prep-cook' },
              { label: s.currentRole.options.manager, value: 'manager' },
              { label: s.currentRole.options['new-hire'], value: 'new-hire' },
              { label: s.currentRole.options['not-yet-working'], value: 'not-yet-working' },
            ]}
            selected={values.currentRole}
            onSelect={(v) => set('currentRole', v)}
          />
        </SettingsField>

        <SettingsField label={f.certification.label} description={f.certification.description}>
          <OptionButtonGroup
            ariaLabel={f.certification.label}
            options={[
              { label: s.certification.options.yes, value: 'yes' },
              { label: s.certification.options.no, value: 'no' },
            ]}
            selected={values.existingCertification}
            onSelect={(v) => set('existingCertification', v)}
          />
        </SettingsField>

        <SettingsField label={f.reason.label} description={f.reason.description}>
          <OptionButtonGroup
            ariaLabel={f.reason.label}
            options={[
              { label: s.reason.options['required-by-employer'], value: 'required-by-employer' },
              { label: s.reason.options['want-to-learn'], value: 'want-to-learn' },
              { label: s.reason.options['renewing-certification'], value: 'renewing-certification' },
              { label: s.reason.options['preparing-for-new-job'], value: 'preparing-for-new-job' },
            ]}
            selected={values.reason}
            onSelect={(v) => set('reason', v)}
          />
        </SettingsField>

        <SettingsField label={f.learningStyle.label} description={f.learningStyle.description}>
          <OptionButtonGroup
            ariaLabel={f.learningStyle.label}
            options={[
              { label: s.learningStyle.options['step-by-step'], value: 'step-by-step' },
              { label: s.learningStyle.options['dive-straight-in'], value: 'dive-straight-in' },
              { label: s.learningStyle.options['quick-overview-first'], value: 'quick-overview-first' },
            ]}
            selected={values.learningStyle}
            onSelect={(v) => set('learningStyle', v)}
          />
        </SettingsField>

        <Button type="submit" fullWidth>
          {en.onboarding.settings.continue}
        </Button>
      </form>
    </div>
  )
}
