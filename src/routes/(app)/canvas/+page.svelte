<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { mobile, showSidebar, user, canvasNodes, canvasConnections, canvasExecuting, canvasOutput } from '$lib/stores';
	import type { CanvasNode, CanvasConnection } from '$lib/types/canvas/a2a';
	import { executeCanvasFlow } from '$lib/utils/canvas/a2aProtocol';
	import { WEBUI_BASE_URL } from '$lib/constants';
	import { toast } from 'svelte-sonner';

	import UserMenu from '$lib/components/layout/Sidebar/UserMenu.svelte';
	import Canvas from '$lib/components/canvas/Canvas.svelte';
	import InputPanel from '$lib/components/canvas/InputPanel.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import Sidebar from '$lib/components/icons/Sidebar.svelte';
	import FloppyDisk from '$lib/components/icons/FloppyDisk.svelte';
	import FolderOpen from '$lib/components/icons/FolderOpen.svelte';

	const i18n = getContext('i18n');

	let localNodes: CanvasNode[] = [];
	let localConnections: CanvasConnection[] = [];
	let userInput: string = '';
	let output: string | null = null;
	let isExecuting: boolean = false;

	onMount(() => {
		// Load from stores
		const unsubscribeNodes = canvasNodes.subscribe((nodes) => {
			localNodes = nodes;
		});
		const unsubscribeConnections = canvasConnections.subscribe((connections) => {
			localConnections = connections;
		});
		const unsubscribeOutput = canvasOutput.subscribe((out) => {
			output = out;
		});

		return () => {
			unsubscribeNodes();
			unsubscribeConnections();
			unsubscribeOutput();
		};
	});

	function handleNodesChange(nodes: CanvasNode[]) {
		localNodes = nodes;
		canvasNodes.set(nodes);
	}

	function handleConnectionsChange(connections: CanvasConnection[]) {
		localConnections = connections;
		canvasConnections.set(connections);
	}

	/**
	 * Chat handler that calls the Open WebUI chat completion API
	 */
	async function chatHandler(messages: any[], modelId: string): Promise<string> {
		const token = localStorage.getItem('token');

		// Use the Open WebUI chat completions endpoint
		const response = await fetch(`${WEBUI_BASE_URL}/api/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				model: modelId,
				messages: messages,
				stream: false
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.detail || 'Failed to get response from model');
		}

		const data = await response.json();
		return data.choices[0]?.message?.content || '';
	}

	async function handleExecute(input: string) {
		if (!input.trim()) {
			toast.error('Please enter some input');
			return;
		}

		if (localNodes.length === 0) {
			toast.error('Please add at least one agent node to the canvas');
			return;
		}

		const agentNodes = localNodes.filter((n) => n.type === 'agent');
		if (agentNodes.length === 0) {
			toast.error('Please add at least one agent node to the canvas');
			return;
		}

		// Check that all agent nodes have models assigned
		const nodesWithoutModels = agentNodes.filter((n) => !n.data.modelId);
		if (nodesWithoutModels.length > 0) {
			toast.error('Please assign a model to all agent nodes');
			return;
		}

		isExecuting = true;
		canvasExecuting.set(true);
		output = null;
		canvasOutput.set(null);

		try {
			const result = await executeCanvasFlow(localNodes, localConnections, input, chatHandler);
			output = result.finalOutput;
			canvasOutput.set(output);

			// Update nodes with execution results
			handleNodesChange(localNodes);

			toast.success('Canvas execution completed');
		} catch (error) {
			console.error('Canvas execution error:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to execute canvas');
		} finally {
			isExecuting = false;
			canvasExecuting.set(false);
		}
	}

	function handleSave() {
		const canvasData = {
			nodes: localNodes,
			connections: localConnections
		};
		const dataStr = JSON.stringify(canvasData, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `canvas-${Date.now()}.json`;
		link.click();
		URL.revokeObjectURL(url);
		toast.success('Canvas saved');
	}

	function handleLoad() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			try {
				const text = await file.text();
				const data = JSON.parse(text);
				localNodes = data.nodes || [];
				localConnections = data.connections || [];
				canvasNodes.set(localNodes);
				canvasConnections.set(localConnections);
				toast.success('Canvas loaded');
			} catch (error) {
				console.error('Failed to load canvas:', error);
				toast.error('Failed to load canvas file');
			}
		};
		input.click();
	}
</script>

<div
	class="flex flex-col w-full h-screen max-h-[100dvh] transition-width duration-200 ease-in-out {$showSidebar
		? 'md:max-w-[calc(100%-260px)]'
		: ''} max-w-full"
>
	<!-- Top Navigation Bar -->
	<nav class="px-2 pt-1.5 backdrop-blur-xl w-full drag-region border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				{#if $mobile}
					<div class="{$showSidebar ? 'md:hidden' : ''} flex flex-none items-center">
						<Tooltip
							content={$showSidebar ? $i18n.t('Close Sidebar') : $i18n.t('Open Sidebar')}
							interactive={true}
						>
							<button
								id="sidebar-toggle-button"
								class="cursor-pointer flex rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition"
								on:click={() => {
									showSidebar.set(!$showSidebar);
								}}
							>
								<div class="self-center p-1.5">
									<Sidebar />
								</div>
							</button>
						</Tooltip>
					</div>
				{/if}

				<div class="flex gap-1 py-1">
					<span class="text-sm font-medium text-gray-800 dark:text-gray-200">
						{$i18n.t('Canvas')}
					</span>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<!-- Save/Load buttons -->
				<Tooltip content="Save Canvas">
					<button
						class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition"
						on:click={handleSave}
					>
						<FloppyDisk className="size-5" />
					</button>
				</Tooltip>

				<Tooltip content="Load Canvas">
					<button
						class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-850 transition"
						on:click={handleLoad}
					>
						<FolderOpen className="size-5" />
					</button>
				</Tooltip>

				{#if $user !== undefined && $user !== null}
					<UserMenu
						className="max-w-[240px]"
						role={$user?.role}
						help={true}
					>
						<button
							class="select-none flex rounded-xl p-1.5 w-full hover:bg-gray-50 dark:hover:bg-gray-850 transition"
							aria-label="User Menu"
						>
							<div class="self-center">
								<img
									src={$user?.profile_image_url}
									class="size-6 object-cover rounded-full"
									alt="User profile"
									draggable="false"
								/>
							</div>
						</button>
					</UserMenu>
				{/if}
			</div>
		</div>
	</nav>

	<!-- Main Content Area -->
	<div class="flex-1 flex overflow-hidden">
		<!-- Canvas Area (Left Side) -->
		<div class="flex-1 overflow-hidden">
			<Canvas
				nodes={localNodes}
				connections={localConnections}
				onNodesChange={handleNodesChange}
				onConnectionsChange={handleConnectionsChange}
			/>
		</div>

		<!-- Input Panel (Right Side) -->
		<div class="w-[400px] flex-shrink-0">
			<InputPanel
				bind:userInput
				canvasOutput={output}
				isExecuting={isExecuting}
				onExecute={handleExecute}
			/>
		</div>
	</div>
</div>
