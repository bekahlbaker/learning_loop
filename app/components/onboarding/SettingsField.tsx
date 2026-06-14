export interface SettingsFieldProps {
  label: string
  description?: string
  fieldId?: string
  children: React.ReactNode
}

export default function SettingsField({ label, description, fieldId, children }: SettingsFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <p id={fieldId} className="text-sm font-medium text-gray-800">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
