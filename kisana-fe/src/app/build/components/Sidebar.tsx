import React from "react"
import { Button } from "@/components/ui/button"

type SidebarProps = {
    components: {
        id: string
        label: string
        icon: string
        color: string
    }[]
    onDragStart: (
        e: React.DragEvent<HTMLDivElement>,
        componentId: string
    ) => void
    onDeleteSelected: () => void
    selectedItem: string | null
}

export function Sidebar({
                            components,
                            onDragStart,
                            onDeleteSelected,
                            selectedItem,
                        }: SidebarProps) {
    return (
        <aside className="w-64 border-r border-slate-700 flex flex-col p-4 gap-4 overflow-y-auto bg-slate-900 text-slate-100">
            <h2 className="text-2xl font-bold mb-2">Components</h2>
            <div className="flex flex-col space-y-2">
                {components.map((comp) => (
                    <div
                        key={comp.id}
                        draggable
                        onDragStart={(ev) => onDragStart(ev, comp.id)}
                        className="flex items-center gap-2 p-2 rounded-md cursor-move border border-slate-700 hover:bg-slate-800"
                    >
                        <div
                            className="h-8 w-8 flex items-center justify-center rounded-md"
                            style={{ backgroundColor: comp.color }}
                        >
                            {/* Minimal placeholder for icon text */}
                            <span className="text-white text-xs uppercase font-bold">
                {comp.icon.slice(0, 2)}
              </span>
                        </div>
                        <span className="font-semibold">{comp.label}</span>
                    </div>
                ))}
            </div>

            <div className="mt-auto space-y-2">
                <Button
                    onClick={onDeleteSelected}
                    variant="destructive"
                    className="w-full"
                    disabled={!selectedItem}
                >
                    Delete Selected
                </Button>
            </div>
        </aside>
    )
}
