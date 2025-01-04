"use client"

import React, { useEffect, useState } from "react"
import componentData from "./components/componentData.json"
import { Sidebar } from "./components/Sidebar"
import { NodeEditor, NodeData, Connection } from "./components/NodeEditor"
import { SettingsPanel } from "./components/SettingsPanel"

/** Helper: create a NodeData object from the JSON definition */
function createNodeData(
    compDef: any,
    x: number,
    y: number,
    locked: boolean = false
): NodeData {
    return {
        id: crypto.randomUUID(),
        label: compDef.label,
        icon: compDef.icon,
        color: compDef.color,
        shape: compDef.shape,
        x,
        y,
        locked,
        ports: compDef.ports,
        config: { ...compDef.defaultConfig },
        fields: compDef.fields,
    }
}

export default function BuilderPage() {
    const [nodes, setNodes] = useState<NodeData[]>([])
    const [connections, setConnections] = useState<Connection[]>([])
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [showSettings, setShowSettings] = useState(false)

    // On mount, place the locked "Core Agent" at center
    useEffect(() => {
        const editorWidth = 1200
        const editorHeight = 800
        const centerX = editorWidth / 2 - 80
        const centerY = editorHeight / 2 - 50

        // find the coreAgent in the JSON
        const coreDef = componentData.find((c) => c.id === "coreAgent")
        if (coreDef) {
            const baseNode = createNodeData(coreDef, centerX, centerY, true)
            setNodes([baseNode])
        }
    }, [])

    // The other components (for the sidebar)
    const sideComps = componentData.filter((c) => c.id !== "coreAgent")

    // ---------------------------
    // Sidebar
    // ---------------------------
    const handleDragStart = (
        e: React.DragEvent<HTMLDivElement>,
        componentId: string
    ) => {
        // Put the component ID into dataTransfer for the drop
        e.dataTransfer.setData("componentId", componentId)
    }

    const handleDeleteSelected = () => {
        if (!selectedNodeId) return
        const node = nodes.find((n) => n.id === selectedNodeId)
        if (!node || node.locked) return // can't delete locked

        // remove any connections referencing this node
        setConnections((prev) =>
            prev.filter(
                (conn) => conn.fromId !== selectedNodeId && conn.toId !== selectedNodeId
            )
        )
        // remove the node itself
        setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId))
        setSelectedNodeId(null)
    }

    // We remove the old "Edit Settings" button from Sidebar
    // because we’ll open settings from each node’s gear icon now.
    // const handleShowSettings = () => {
    //   if (!selectedNodeId) return
    //   setShowSettings(true)
    // }

    // ---------------------------
    // NodeEditor
    // ---------------------------
    const onSelectNode = (nodeId: string | null) => {
        setSelectedNodeId(nodeId)
    }

    const onNodeDrag = (nodeId: string, x: number, y: number) => {
        setNodes((prev) =>
            prev.map((n) => (n.id === nodeId ? { ...n, x, y } : n))
        )
    }

    const onCreateConnection = (
        fromId: string,
        fromPort: string,
        toId: string,
        toPort: string,
        color?: string
    ) => {
        // check for duplicates
        const alreadyExists = connections.some(
            (c) =>
                c.fromId === fromId &&
                c.fromPort === fromPort &&
                c.toId === toId &&
                c.toPort === toPort
        )
        if (alreadyExists) return

        setConnections((prev) => [
            ...prev,
            { fromId, fromPort, toId, toPort, color },
        ])
    }

    // ---------------------------
    // Drop new component onto the canvas
    // ---------------------------
    const handleEditorDrop = (ev: React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault()
        const compId = ev.dataTransfer.getData("componentId")
        const compDef = componentData.find((c) => c.id === compId)
        if (!compDef) return

        const editorRect = ev.currentTarget.getBoundingClientRect()
        // Snap to grid 20px, offset so the node center is near the mouse
        const x = Math.round((ev.clientX - editorRect.left - 80) / 20) * 20
        const y = Math.round((ev.clientY - editorRect.top - 50) / 20) * 20

        const newNode = createNodeData(compDef, x, y, false)
        setNodes((prev) => [...prev, newNode])
    }

    const handleEditorDragOver = (ev: React.DragEvent<HTMLDivElement>) => {
        ev.preventDefault()
    }

    // ---------------------------
    // Settings
    // ---------------------------
    const handleShowNodeSettings = (nodeId: string) => {
        setSelectedNodeId(nodeId)
        setShowSettings(true)
    }

    const selectedNode = nodes.find((n) => n.id === selectedNodeId)
    const handleConfigChange = (key: string, value: any) => {
        if (!selectedNodeId) return
        setNodes((prev) =>
            prev.map((n) =>
                n.id === selectedNodeId
                    ? {
                        ...n,
                        config: {
                            ...n.config,
                            [key]: value,
                        },
                    }
                    : n
            )
        )
    }
    const handleCloseSettings = () => {
        setShowSettings(false)
    }

    return (
        <div className="w-full h-screen flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                components={sideComps.map((c) => ({
                    id: c.id,
                    label: c.label,
                    icon: c.icon,
                    color: c.color,
                }))}
                onDragStart={handleDragStart}
                onDeleteSelected={handleDeleteSelected}
                selectedItem={selectedNodeId}
            />

            {/* NodeEditor */}
            <div
                className="relative flex-1"
                onDrop={handleEditorDrop}
                onDragOver={handleEditorDragOver}
            >
                <NodeEditor
                    nodes={nodes}
                    connections={connections}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    onNodeDrag={onNodeDrag}
                    onCreateConnection={onCreateConnection}
                    onShowSettings={handleShowNodeSettings} // new prop
                />
            </div>

            {/* Settings panel */}
            {showSettings && selectedNode && (
                <SettingsPanel
                    label={selectedNode.label}
                    fields={selectedNode.fields}
                    config={selectedNode.config}
                    onChange={handleConfigChange}
                    onClose={handleCloseSettings}
                />
            )}
        </div>
    )
}