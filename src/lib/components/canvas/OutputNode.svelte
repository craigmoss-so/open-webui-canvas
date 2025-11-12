<script lang="ts">
	import { getContext } from 'svelte';
	import type { CanvasNode } from '$lib/types/canvas/a2a';
	import GarbageBin from '../icons/GarbageBin.svelte';

	const i18n = getContext('i18n');

	export let node: CanvasNode;
	export let isSelected: boolean = false;
	export let onDelete: (nodeId: string) => void;

	function handleDelete() {
		onDelete(node.id);
	}
</script>

<div
	class="output-node relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg border-2 transition-all {isSelected
		? 'border-yellow-400'
		: 'border-purple-700'}"
	style="min-width: 280px; max-width: 320px;"
>
	<!-- Delete button -->
	<button
		class="absolute top-2 right-2 p-1 rounded hover:bg-white/20"
		on:click={handleDelete}
		title="Delete node"
	>
		<GarbageBin className="size-4 text-white" />
	</button>

	<!-- Node header -->
	<div class="p-3 border-b border-purple-400/30">
		<div class="flex items-center space-x-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-5 text-white"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			<span class="text-sm font-semibold text-white">Output Node</span>
		</div>
	</div>

	<!-- Output content -->
	<div class="p-3">
		{#if node.data.output}
			<div class="text-xs text-white/90 mb-1">Final Output</div>
			<div class="bg-white/10 backdrop-blur-sm p-3 rounded text-white text-sm max-h-40 overflow-y-auto">
				{node.data.output}
			</div>
		{:else}
			<div class="text-xs text-white/70 italic">
				Connect agent nodes to this output node to see results
			</div>
		{/if}
	</div>

	<!-- Connection handle (input only) -->
	<div class="absolute -left-2 top-1/2 -translate-y-1/2">
		<div
			class="w-4 h-4 bg-yellow-400 rounded-full border-2 border-white dark:border-gray-800 cursor-crosshair"
			data-handle="input"
			data-node-id={node.id}
			title="Input"
		></div>
	</div>
</div>

<style>
	.output-node {
		user-select: none;
	}
</style>
