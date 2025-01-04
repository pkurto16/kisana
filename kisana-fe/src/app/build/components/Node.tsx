import React, { MouseEvent } from "react"
import clsx from "clsx"

export type PortDirection = "input" | "output"
export type PortType = string

export type IOPort = {
    id: string
    label: string
    color: string
    direction: PortDirection
    required?: boolean
    type?: PortType
}

export type NodeShape = "circle" | "roundedRect" | "diamond" | "hex" | "octo"

export interface NodeProps {
    id: string
    label: string
    color: string
    shape: NodeShape
    x: number
    y: number
    locked?: boolean
    selected?: boolean
    ports: IOPort[]
    onMouseDownNode: (e: MouseEvent<HTMLDivElement>, nodeId: string) => void
    onClickNode: (e: MouseEvent<HTMLDivElement>, nodeId: string) => void
    onPortMouseDown: (
        e: MouseEvent<HTMLDivElement>,
        nodeId: string,
        portId: string,
        direction: PortDirection,
        portType?: string
    ) => void
    onPortMouseUp: (
        e: MouseEvent<HTMLDivElement>,
        nodeId: string,
        portId: string,
        direction: PortDirection,
        portType?: string
    ) => void

    // NEW: so each node can open settings from a gear icon
    onShowSettings: (nodeId: string) => void
}

function getNodeShapeClass(shape: NodeShape) {
    switch (shape) {
        case "circle":
            return "rounded-full"
        case "roundedRect":
            return "rounded-xl"
        case "diamond":
            return "diamond-shape"
        case "hex":
            return "hex-shape"
        case "octo":
            return "octo-shape"
        default:
            return "rounded-xl"
    }
}

export function Node(props: NodeProps) {
    const {
        id,
        label,
        color,
        shape,
        x,
        y,
        locked,
        selected,
        ports,
        onMouseDownNode,
        onClickNode,
        onPortMouseDown,
        onPortMouseUp,
        onShowSettings,
    } = props

    return (
        <div
            className={clsx(
                "absolute flex flex-col items-center justify-center text-center select-none border-2 border-transparent",
                getNodeShapeClass(shape),
                selected ? "border-blue-300 shadow-2xl" : "shadow-md",
            )}
            style={{
                width: 160,
                height: 100,
                left: x,
                top: y,
                backgroundColor: color,
            }}
            onMouseDown={(e) => onMouseDownNode(e, id)}
            onClick={(e) => onClickNode(e, id)}
        >
            {/* Node Label */}
            <span className="text-sm font-semibold text-white drop-shadow mb-1">
        {label}
      </span>

            {/* Small gear icon in the top-right corner for settings */}
            {!locked && (
                <div
                    className="absolute top-1 right-1 text-white hover:text-yellow-300 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation()
                        onShowSettings(id)
                    }}
                    title="Edit Settings"
                >
                    {/* Simple gear SVG or any icon you like */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.049 2.927c.3-1.14 1.602-1.14 1.902 0a1.724 1.724 0 002.168 1.167l.359-.134c1.01-.375 2.09.643 1.716 1.653l-.134.359a1.724 1.724 0 001.168 2.168c1.14.3 1.14 1.602 0 1.902a1.724 1.724 0 00-1.168 2.168l.134.359c.375 1.01-.643 2.09-1.653 1.716l-.359-.134a1.724 1.724 0 00-2.168 1.168c-.3 1.14-1.602 1.14-1.902 0a1.724 1.724 0 00-2.168-1.168l-.359.134c-1.01.375-2.09-.643-1.716-1.653l.134-.359a1.724 1.724 0 00-1.168-2.168c-1.14-.3-1.14-1.602 0-1.902a1.724 1.724 0 001.168-2.168l-.134-.359c-.375-1.01.643-2.09 1.653-1.716l.359.134a1.724 1.724 0 002.168-1.168z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
            )}

            {/* Left side for inputs */}
            <div className="absolute flex flex-col space-y-2 items-start left-2 top-1/2 -translate-y-1/2">
                {ports
                    .filter((p) => p.direction === "input")
                    .map((port) => (
                        <div
                            key={port.id}
                            onMouseDown={(e) =>
                                onPortMouseDown(e, id, port.id, port.direction, port.type)
                            }
                            onMouseUp={(e) =>
                                onPortMouseUp(e, id, port.id, port.direction, port.type)
                            }
                            className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                            style={{
                                backgroundColor: port.color,
                            }}
                            title={`${port.direction.toUpperCase()}: ${port.label}`}
                        >
                            ←
                        </div>
                    ))}
            </div>

            {/* Right side for outputs */}
            <div className="absolute flex flex-col space-y-2 items-end right-2 top-1/2 -translate-y-1/2">
                {ports
                    .filter((p) => p.direction === "output")
                    .map((port) => (
                        <div
                            key={port.id}
                            onMouseDown={(e) =>
                                onPortMouseDown(e, id, port.id, port.direction, port.type)
                            }
                            onMouseUp={(e) =>
                                onPortMouseUp(e, id, port.id, port.direction, port.type)
                            }
                            className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                            style={{
                                backgroundColor: port.color,
                            }}
                            title={`${port.direction.toUpperCase()}: ${port.label}`}
                        >
                            →
                        </div>
                    ))}
            </div>

        </div>
    )
}