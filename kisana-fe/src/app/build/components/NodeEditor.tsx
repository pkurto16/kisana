"use client"
import React, { useState, useRef, useEffect, MouseEvent } from "react"
import { Node, PortDirection } from "./Node"
import { NodeShape } from "./Node"

export type Connection = {
    fromId: string
    toId: string
    fromPort: string
    toPort: string
    color?: string
}

type TempConnection = {
    fromId: string
    fromPort: string
    fromType?: string
    x1: number
    y1: number
    x2: number
    y2: number
}

const GRID_SIZE = 20

// Snap to a 20px grid
function snapToGrid(value: number) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE
}

// Color lines based on port type
function getLineColor(portType: string | undefined) {
    switch (portType) {
        case "text":
            return "#3b82f6"
        case "json":
            return "#f59e0b"
        case "file":
            return "#8b5cf6"
        case "log":
            return "#a78bfa"
        default:
            return "#38bdf8"
    }
}

// Create a path with two 90-degree bends
function create90DegreePath(x1: number, y1: number, x2: number, y2: number) {
    const midX = (x1 + x2) / 2
    return [
        [x1, y1],
        [midX, y1],
        [midX, y2],
        [x2, y2],
    ]
}

export interface NodeData {
    id: string
    label: string
    icon: string
    color: string
    shape: NodeShape
    x: number
    y: number
    locked?: boolean
    ports: {
        id: string
        label: string
        color: string
        direction: PortDirection
        required?: boolean
        type?: string
    }[]
    config: Record<string, any>
    fields: { name: string; label: string; type: string }[]
}

interface NodeEditorProps {
    nodes: NodeData[]
    connections: Connection[]
    selectedNodeId: string | null
    onSelectNode: (nodeId: string | null) => void
    onNodeDrag: (nodeId: string, x: number, y: number) => void
    onCreateConnection: (
        fromId: string,
        fromPort: string,
        toId: string,
        toPort: string,
        color?: string
    ) => void
    // NEW: so we can open settings from each node
    onShowSettings: (nodeId: string) => void

    className?: string
}

export function NodeEditor({
                               nodes,
                               connections,
                               selectedNodeId,
                               onSelectNode,
                               onNodeDrag,
                               onCreateConnection,
                               onShowSettings,
                               className = "",
                           }: NodeEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null)

    // Track which node is being dragged (if any)
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
    // The mouse offset from the node’s top-left corner at drag start
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

    // Temporary connection (while user drags from an output port to an input port)
    const [tempConnection, setTempConnection] = useState<TempConnection | null>(
        null
    )

    /** MOUSE / DRAG HANDLERS */
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!editorRef.current) return

        // Move node
        if (draggingNodeId) {
            e.preventDefault()
            const rect = editorRef.current.getBoundingClientRect()
            const newX = snapToGrid(
                (e.clientX - rect.left) - dragOffset.x
            )
            const newY = snapToGrid(
                (e.clientY - rect.top) - dragOffset.y
            )
            onNodeDrag(draggingNodeId, newX, newY)
        }

        // Update temp connection line
        if (tempConnection) {
            e.preventDefault()
            const rect = editorRef.current.getBoundingClientRect()
            const x2 = e.clientX - rect.left
            const y2 = e.clientY - rect.top
            setTempConnection((prev) => (prev ? { ...prev, x2, y2 } : null))
        }
    }

    const handleMouseUp = () => {
        // Stop dragging
        setDraggingNodeId(null)

        // If user stops dragging mid-connection, cancel
        if (tempConnection) {
            setTempConnection(null)
        }
    }

    const handleCanvasClick = () => {
        // If user clicks empty space, deselect node
        onSelectNode(null)
    }

    /**
     * NODE EVENTS
     */
    const handleMouseDownNode = (e: MouseEvent<HTMLDivElement>, nodeId: string) => {
        e.stopPropagation()
        e.preventDefault()

        const node = nodes.find((n) => n.id === nodeId)
        if (!node || node.locked) return

        onSelectNode(nodeId)

        if (editorRef.current) {
            const rect = editorRef.current.getBoundingClientRect()
            const offsetX = (e.clientX - rect.left) - node.x
            const offsetY = (e.clientY - rect.top) - node.y
            setDraggingNodeId(nodeId)
            setDragOffset({ x: offsetX, y: offsetY })
        }
    }

    // If you only want to select a node (without dragging) on click:
    // we can keep or remove. But let's keep minimal changes.
    const handleClickNode = (e: MouseEvent<HTMLDivElement>, nodeId: string) => {
        e.stopPropagation()
        if (selectedNodeId !== nodeId) {
            onSelectNode(nodeId)
        }
    }

    /**
     * PORT EVENTS
     */
    const handlePortMouseDown = (
        e: MouseEvent<HTMLDivElement>,
        nodeId: string,
        portId: string,
        direction: PortDirection,
        portType?: string
    ) => {
        e.stopPropagation()
        e.preventDefault()

        // Start a connection only if it's an output port
        if (direction !== "output") return
        const node = nodes.find((n) => n.id === nodeId)
        if (!node || !editorRef.current) return

        const rect = editorRef.current.getBoundingClientRect()
        const x1 = node.x + 80
        const y1 = node.y + 50

        setTempConnection({
            fromId: nodeId,
            fromPort: portId,
            fromType: portType,
            x1,
            y1,
            x2: x1,
            y2: y1,
        })
    }

    const handlePortMouseUp = (
        e: MouseEvent<HTMLDivElement>,
        nodeId: string,
        portId: string,
        direction: PortDirection,
        portType?: string
    ) => {
        e.stopPropagation()
        e.preventDefault()

        // End a connection only if it's an input port
        if (direction !== "input") return

        if (tempConnection) {
            // If port types match or are unspecified, create it
            if (
                !tempConnection.fromType ||
                !portType ||
                tempConnection.fromType === portType
            ) {
                onCreateConnection(
                    tempConnection.fromId,
                    tempConnection.fromPort,
                    nodeId,
                    portId,
                    getLineColor(tempConnection.fromType)
                )
            }
            setTempConnection(null)
        }
    }

    return (
        <div
            ref={editorRef}
            className={`relative w-full h-screen ${className}`}
            style={{ overflow: "hidden" }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
        >
            {/* Background grid */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundColor: "#0f172a",
                    backgroundImage:
                        "linear-gradient(to right, rgba(100,116,139,0.2) 1px, transparent 1px)," +
                        "linear-gradient(to bottom, rgba(100,116,139,0.2) 1px, transparent 1px)",
                    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                }}
            />

            {/* SVG lines */}
            <svg className="absolute inset-0 pointer-events-none z-10">
                <defs>
                    <marker
                        id="endArrow"
                        markerWidth="10"
                        markerHeight="10"
                        refX="5"
                        refY="5"
                        orient="auto"
                    >
                        <path d="M0,0 L0,10 L10,5 z" fill="#38bdf8" />
                    </marker>
                </defs>

                {/* Existing connections */}
                {connections.map((conn, idx) => {
                    const fromNode = nodes.find((n) => n.id === conn.fromId)
                    const toNode = nodes.find((n) => n.id === conn.toId)
                    if (!fromNode || !toNode) return null

                    const pathPoints = create90DegreePath(
                        fromNode.x + 80,
                        fromNode.y + 50,
                        toNode.x + 80,
                        toNode.y + 50
                    )
                    const pathD = pathPoints
                        .map((pt, i) =>
                            i === 0 ? `M ${pt[0]},${pt[1]}` : `L ${pt[0]},${pt[1]}`
                        )
                        .join(" ")

                    return (
                        <path
                            key={idx}
                            d={pathD}
                            stroke={conn.color || "#38bdf8"}
                            strokeWidth={3}
                            fill="none"
                            markerEnd="url(#endArrow)"
                            strokeLinejoin="round"
                            strokeDasharray="2,3"
                        />
                    )
                })}

                {/* Temp connection line */}
                {tempConnection && (
                    <path
                        d={
                            create90DegreePath(
                                tempConnection.x1,
                                tempConnection.y1,
                                tempConnection.x2,
                                tempConnection.y2
                            )
                                .map((pt, i) =>
                                    i === 0 ? `M ${pt[0]},${pt[1]}` : `L ${pt[0]},${pt[1]}`
                                )
                                .join(" ")
                        }
                        stroke={getLineColor(tempConnection.fromType)}
                        strokeWidth={3}
                        fill="none"
                        markerEnd="url(#endArrow)"
                        strokeLinejoin="round"
                        strokeDasharray="2,3"
                    />
                )}
            </svg>

            {/* Nodes */}
            <div className="relative w-full h-full z-20">
                {nodes.map((node) => (
                    <Node
                        key={node.id}
                        id={node.id}
                        label={node.label}
                        color={node.color}
                        shape={node.shape}
                        x={node.x}
                        y={node.y}
                        locked={node.locked}
                        selected={node.id === selectedNodeId}
                        ports={node.ports}
                        onMouseDownNode={handleMouseDownNode}
                        onClickNode={handleClickNode}
                        onPortMouseDown={handlePortMouseDown}
                        onPortMouseUp={handlePortMouseUp}
                        // Pass the onShowSettings so each node can show a gear icon
                        onShowSettings={onShowSettings}
                    />
                ))}
            </div>
        </div>
    )
}