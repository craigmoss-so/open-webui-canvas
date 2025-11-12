<script lang="ts">
	import { models } from '$lib/stores';
	import { getContext } from 'svelte';
	import type { CanvasNode } from '$lib/types/canvas/a2a';
	import ChevronDown from '../icons/ChevronDown.svelte';
	import GarbageBin from '../icons/GarbageBin.svelte';

	const i18n = getContext('i18n');

	export let node: CanvasNode;
	export let isSelected: boolean = false;
	export let onUpdate: (node: CanvasNode) => void;
	export let onDelete: (nodeId: string) => void;

	let showModelSelector = false;
	let label = node.data.label || 'Agent Node';

	$: selectedModel = node.data.modelId
		? $models.find((m) => m.id === node.data.modelId)
		: null;

	function handleModelSelect(modelId: string) {
		node.data.modelId = modelId;
		onUpdate(node);
		showModelSelector = false;
	}

	function handleLabelChange(e: Event) {
		const target = e.target as HTMLInputElement;
		node.data.label = target.value;
		label = target.value;
		onUpdate(node);
	}

	function handleDelete() {
		onDelete(node.id);
	}

	$: statusColor =
		node.data.task?.status.state === 'completed'
			? 'bg-green-500'
			: node.data.task?.status.state === 'working'
				? 'bg-yellow-500'
				: node.data.task?.status.state === 'failed'
					? 'bg-red-500'
					: 'bg-gray-500';
</script>

<div
	class="agent-node relative bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 transition-all {isSelected
		? 'border-blue-500'
		: 'border-gray-300 dark:border-gray-600'}"
	style="min-width: 280px; max-width: 320px;"
>
	<!-- Status indicator -->
	{#if node.data.task}
		<div
			class="absolute top-2 right-2 w-3 h-3 rounded-full {statusColor}"
			title={node.data.task.status.message}
		></div>
	{/if}

	<!-- Delete button -->
	<button
		class="absolute top-2 right-8 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
		on:click={handleDelete}
		title="Delete node"
	>
		<GarbageBin className="size-4 text-gray-600 dark:text-gray-400" />
	</button>

	<!-- Node header -->
	<div class="p-3 border-b border-gray-200 dark:border-gray-700">
		<input
			type="text"
			value={label}
			on:input={handleLabelChange}
			class="w-full bg-transparent text-sm font-semibold text-gray-800 dark:text-gray-200 outline-none"
			placeholder="Agent Node"
		/>
	</div>

	<!-- Model selector -->
	<div class="p-3">
		<div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Model</div>
		<div class="relative">
			<button
				class="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-sm"
				on:click={() => (showModelSelector = !showModelSelector)}
			>
				<span class="truncate">
					{selectedModel ? selectedModel.name : 'Select Model'}
				</span>
				<ChevronDown className="size-4 ml-2 flex-shrink-0" />
			</button>

			{#if showModelSelector}
				<div
					class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
				>
					{#each $models as model}
						<button
							class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
							on:click={() => handleModelSelect(model.id)}
						>
							<div class="font-medium text-gray-800 dark:text-gray-200">{model.name}</div>
							{#if model.info?.meta?.description}
								<div class="text-xs text-gray-600 dark:text-gray-400 truncate">
									{model.info.meta.description}
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Task status -->
	{#if node.data.task}
		<div class="px-3 pb-3">
			<div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</div>
			<div class="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
				{node.data.task.status.message || node.data.task.status.state}
			</div>
		</div>
	{/if}

	<!-- Output preview -->
	{#if node.data.output}
		<div class="px-3 pb-3">
			<div class="text-xs text-gray-600 dark:text-gray-400 mb-1">Output Preview</div>
			<div
				class="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded max-h-20 overflow-y-auto break-words"
			>
				{node.data.output.substring(0, 100)}...
			</div>
		</div>
	{/if}

	<!-- Connection handles -->
	<div class="absolute -left-2 top-1/2 -translate-y-1/2">
		<div
			class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 cursor-crosshair"
			data-handle="input"
			data-node-id={node.id}
			title="Input"
		></div>
	</div>
	<div class="absolute -right-2 top-1/2 -translate-y-1/2">
		<div
			class="w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 cursor-crosshair"
			data-handle="output"
			data-node-id={node.id}
			title="Output"
		></div>
	</div>
</div>

<style>
	.agent-node {
		user-select: none;
	}
</style>
