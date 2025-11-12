<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import type { CanvasNode, CanvasConnection } from '$lib/types/canvas/a2a';
	import AgentNode from './AgentNode.svelte';
	import OutputNode from './OutputNode.svelte';

	const i18n = getContext('i18n');

	export let nodes: CanvasNode[] = [];
	export let connections: CanvasConnection[] = [];
	export let onNodesChange: (nodes: CanvasNode[]) => void;
	export let onConnectionsChange: (connections: CanvasConnection[]) => void;

	let canvasElement: HTMLDivElement;
	let svgElement: SVGSVGElement;
	let isDragging = false;
	let draggedNode: CanvasNode | null = null;
	let dragOffset = { x: 0, y: 0 };
	let selectedNodeId: string | null = null;
	let isConnecting = false;
	let connectionStart: { nodeId: string; handle: string } | null = null;
	let tempConnectionEnd = { x: 0, y: 0 };
	let canvasOffset = { x: 0, y: 0 };
	let canvasScale = 1;
	let isPanning = false;
	let panStart = { x: 0, y: 0 };

	function addAgentNode() {
		const newNode: CanvasNode = {
			id: uuidv4(),
			type: 'agent',
			position: {
				x: (canvasElement.clientWidth / 2 - 150) / canvasScale - canvasOffset.x,
				y: (canvasElement.clientHeight / 2 - 100) / canvasScale - canvasOffset.y
			},
			data: {
				label: `Agent ${nodes.filter((n) => n.type === 'agent').length + 1}`
			}
		};
		nodes = [...nodes, newNode];
		onNodesChange(nodes);
	}

	function addOutputNode() {
		// Check if output node already exists
		if (nodes.some((n) => n.type === 'output')) {
			alert('Only one output node is allowed');
			return;
		}

		const newNode: CanvasNode = {
			id: uuidv4(),
			type: 'output',
			position: {
				x: (canvasElement.clientWidth / 2 - 150) / canvasScale - canvasOffset.x,
				y: (canvasElement.clientHeight / 2 - 100) / canvasScale - canvasOffset.y
			},
			data: {}
		};
		nodes = [...nodes, newNode];
		onNodesChange(nodes);
	}

	function handleNodeMouseDown(node: CanvasNode, event: MouseEvent) {
		if ((event.target as HTMLElement).closest('[data-handle]')) {
			return; // Don't drag if clicking on a handle
		}

		isDragging = true;
		draggedNode = node;
		selectedNodeId = node.id;
		const rect = canvasElement.getBoundingClientRect();
		dragOffset = {
			x: event.clientX / canvasScale - rect.left / canvasScale - canvasOffset.x - node.position.x,
			y: event.clientY / canvasScale - rect.top / canvasScale - canvasOffset.y - node.position.y
		};
	}

	function handleMouseMove(event: MouseEvent) {
		if (isDragging && draggedNode) {
			const rect = canvasElement.getBoundingClientRect();
			const newX = event.clientX / canvasScale - rect.left / canvasScale - canvasOffset.x - dragOffset.x;
			const newY = event.clientY / canvasScale - rect.top / canvasScale - canvasOffset.y - dragOffset.y;

			draggedNode.position = { x: newX, y: newY };
			nodes = [...nodes];
			onNodesChange(nodes);
		} else if (isConnecting && connectionStart) {
			const rect = canvasElement.getBoundingClientRect();
			tempConnectionEnd = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			};
		} else if (isPanning) {
			const dx = event.clientX - panStart.x;
			const dy = event.clientY - panStart.y;
			canvasOffset = {
				x: canvasOffset.x + dx / canvasScale,
				y: canvasOffset.y + dy / canvasScale
			};
			panStart = { x: event.clientX, y: event.clientY };
		}
	}

	function handleMouseUp(event: MouseEvent) {
		if (isConnecting && connectionStart) {
			const target = event.target as HTMLElement;
			const handle = target.closest('[data-handle]');

			if (handle && handle.getAttribute('data-handle') === 'input') {
				const targetNodeId = handle.getAttribute('data-node-id');

				if (targetNodeId && targetNodeId !== connectionStart.nodeId) {
					const newConnection: CanvasConnection = {
						id: uuidv4(),
						sourceId: connectionStart.nodeId,
						targetId: targetNodeId,
						sourceHandle: connectionStart.handle,
						targetHandle: 'input'
					};
					connections = [...connections, newConnection];
					onConnectionsChange(connections);
				}
			}
		}

		isDragging = false;
		draggedNode = null;
		isConnecting = false;
		connectionStart = null;
		isPanning = false;
	}

	function handleHandleMouseDown(node: CanvasNode, handle: string, event: MouseEvent) {
		event.stopPropagation();

		if (handle === 'output') {
			isConnecting = true;
			connectionStart = { nodeId: node.id, handle };

			const rect = canvasElement.getBoundingClientRect();
			tempConnectionEnd = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			};
		}
	}

	function deleteNode(nodeId: string) {
		nodes = nodes.filter((n) => n.id !== nodeId);
		connections = connections.filter((c) => c.sourceId !== nodeId && c.targetId !== nodeId);
		onNodesChange(nodes);
		onConnectionsChange(connections);
		selectedNodeId = null;
	}

	function deleteConnection(connectionId: string) {
		connections = connections.filter((c) => c.id !== connectionId);
		onConnectionsChange(connections);
	}

	function handleCanvasMouseDown(event: MouseEvent) {
		if (event.target === canvasElement || event.target === svgElement) {
			if (event.button === 0 && (event.ctrlKey || event.metaKey)) {
				// Ctrl/Cmd + Click to pan
				isPanning = true;
				panStart = { x: event.clientX, y: event.clientY };
			} else {
				selectedNodeId = null;
			}
		}
	}

	function handleWheel(event: WheelEvent) {
		if (event.ctrlKey || event.metaKey) {
			event.preventDefault();
			const delta = event.deltaY > 0 ? 0.9 : 1.1;
			canvasScale = Math.max(0.1, Math.min(3, canvasScale * delta));
		}
	}

	function getNodeCenter(node: CanvasNode): { x: number; y: number } {
		return {
			x: (node.position.x + 140) * canvasScale + canvasOffset.x * canvasScale,
			y: (node.position.y + 80) * canvasScale + canvasOffset.y * canvasScale
		};
	}

	function getHandlePosition(
		node: CanvasNode,
		handle: string
	): { x: number; y: number } {
		const center = getNodeCenter(node);
		if (handle === 'input') {
			return { x: center.x - 140 * canvasScale, y: center.y };
		} else {
			return { x: center.x + 140 * canvasScale, y: center.y };
		}
	}

	function updateNode(updatedNode: CanvasNode) {
		nodes = nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
		onNodesChange(nodes);
	}

	onMount(() => {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	});
</script>

<div class="canvas-container relative w-full h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
	<!-- Toolbar -->
	<div
		class="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2"
	>
		<button
			class="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition"
			on:click={addAgentNode}
		>
			+ Agent Node
		</button>
		<button
			class="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium transition"
			on:click={addOutputNode}
		>
			+ Output Node
		</button>
		<div class="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
			<div>Zoom: {(canvasScale * 100).toFixed(0)}%</div>
			<div class="text-xs mt-1">Ctrl+Wheel to zoom</div>
			<div class="text-xs">Ctrl+Drag to pan</div>
		</div>
	</div>

	<!-- Canvas -->
	<div
		bind:this={canvasElement}
		class="canvas-area w-full h-full cursor-default"
		on:mousedown={handleCanvasMouseDown}
		on:wheel={handleWheel}
		role="application"
		tabindex="0"
	>
		<!-- SVG for connections -->
		<svg
			bind:this={svgElement}
			class="absolute inset-0 w-full h-full pointer-events-none"
			style="z-index: 1;"
		>
			<defs>
				<marker
					id="arrowhead"
					markerWidth="10"
					markerHeight="10"
					refX="9"
					refY="3"
					orient="auto"
				>
					<polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
				</marker>
			</defs>

			<!-- Existing connections -->
			{#each connections as connection (connection.id)}
				{@const sourceNode = nodes.find((n) => n.id === connection.sourceId)}
				{@const targetNode = nodes.find((n) => n.id === connection.targetId)}
				{#if sourceNode && targetNode}
					{@const start = getHandlePosition(sourceNode, 'output')}
					{@const end = getHandlePosition(targetNode, 'input')}
					{@const midX = (start.x + end.x) / 2}
					<g class="pointer-events-auto cursor-pointer" on:click={() => deleteConnection(connection.id)}>
						<path
							d="M {start.x} {start.y} C {midX} {start.y}, {midX} {end.y}, {end.x} {end.y}"
							stroke="#3b82f6"
							stroke-width="2"
							fill="none"
							marker-end="url(#arrowhead)"
						/>
						<!-- Invisible thicker path for easier clicking -->
						<path
							d="M {start.x} {start.y} C {midX} {start.y}, {midX} {end.y}, {end.x} {end.y}"
							stroke="transparent"
							stroke-width="20"
							fill="none"
						/>
					</g>
				{/if}
			{/each}

			<!-- Temporary connection while dragging -->
			{#if isConnecting && connectionStart}
				{@const sourceNode = nodes.find((n) => n.id === connectionStart.nodeId)}
				{#if sourceNode}
					{@const start = getHandlePosition(sourceNode, 'output')}
					{@const midX = (start.x + tempConnectionEnd.x) / 2}
					<path
						d="M {start.x} {start.y} C {midX} {start.y}, {midX} {tempConnectionEnd.y}, {tempConnectionEnd.x} {tempConnectionEnd.y}"
						stroke="#3b82f6"
						stroke-width="2"
						stroke-dasharray="5,5"
						fill="none"
						opacity="0.6"
					/>
				{/if}
			{/if}
		</svg>

		<!-- Nodes -->
		<div
			class="absolute inset-0"
			style="transform: translate({canvasOffset.x * canvasScale}px, {canvasOffset.y *
				canvasScale}px) scale({canvasScale}); transform-origin: 0 0; z-index: 2;"
		>
			{#each nodes as node (node.id)}
				<div
					class="absolute cursor-move"
					style="left: {node.position.x}px; top: {node.position.y}px;"
					on:mousedown={(e) => handleNodeMouseDown(node, e)}
					role="button"
					tabindex="0"
				>
					{#if node.type === 'agent'}
						<AgentNode
							{node}
							isSelected={selectedNodeId === node.id}
							onUpdate={updateNode}
							onDelete={deleteNode}
						/>
					{:else if node.type === 'output'}
						<OutputNode {node} isSelected={selectedNodeId === node.id} onDelete={deleteNode} />
					{/if}

					<!-- Connection handles -->
					{#if node.type === 'agent'}
						<div
							class="absolute -right-2 top-1/2 -translate-y-1/2"
							on:mousedown={(e) => handleHandleMouseDown(node, 'output', e)}
							role="button"
							tabindex="0"
						></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.canvas-container {
		position: relative;
	}

	.canvas-area:focus {
		outline: none;
	}
</style>
