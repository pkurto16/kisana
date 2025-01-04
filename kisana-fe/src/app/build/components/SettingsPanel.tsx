import React from "react"
import { Button } from "@/components/ui/button"

type FieldDef = {
    name: string
    label: string
    type: "text" | "number" | "boolean"
}

interface SettingsPanelProps {
    label: string
    fields: FieldDef[]
    config: Record<string, any>
    onChange: (key: string, value: any) => void
    onClose: () => void
}

export function SettingsPanel({
                                  label,
                                  fields,
                                  config,
                                  onChange,
                                  onClose,
                              }: SettingsPanelProps) {
    return (
        <div className="absolute inset-0 flex justify-center items-center bg-black/50 z-50">
            <div className="bg-slate-800 p-4 rounded-md w-1/3 relative">
                <h2 className="text-xl font-bold mb-2">{label} Settings</h2>
                <button
                    className="absolute top-2 right-2 text-slate-500 hover:text-white"
                    onClick={onClose}
                >
                    ✕
                </button>
                {fields.map((field) => {
                    const val = config[field.name]
                    return (
                        <div className="mb-3" key={field.name}>
                            <label className="block text-sm font-medium mb-1">
                                {field.label}
                            </label>
                            {field.type === "boolean" ? (
                                <input
                                    type="checkbox"
                                    checked={!!val}
                                    onChange={(e) => onChange(field.name, e.target.checked)}
                                    className="h-4 w-4 text-slate-700"
                                />
                            ) : (
                                <input
                                    type={field.type === "number" ? "number" : "text"}
                                    value={val}
                                    onChange={(e) => onChange(field.name, e.target.value)}
                                    className="w-full p-2 bg-slate-700 text-white rounded focus:outline-none"
                                />
                            )}
                        </div>
                    )
                })}
                <Button onClick={onClose} className="mt-2 bg-green-600 hover:bg-green-700">
                    Save
                </Button>
            </div>
        </div>
    )
}
