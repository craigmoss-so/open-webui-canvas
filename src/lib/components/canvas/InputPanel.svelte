<script lang="ts">
	import { getContext } from 'svelte';
	import { marked } from 'marked';
	import ArrowUpCircle from '../icons/ArrowUpCircle.svelte';
	import Spinner from '../common/Spinner.svelte';

	const i18n = getContext('i18n');

	export let userInput: string = '';
	export let canvasOutput: string | null = null;
	export let isExecuting: boolean = false;
	export let onExecute: (input: string) => Promise<void>;

	let textArea: HTMLTextAreaElement;

	async function handleSubmit() {
		if (!userInput.trim() || isExecuting) return;

		const input = userInput;
		userInput = '';
		await onExecute(input);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}

	function autoResize() {
		if (textArea) {
			textArea.style.height = 'auto';
			textArea.style.height = textArea.scrollHeight + 'px';
		}
	}

	$: if (textArea && userInput !== undefined) {
		autoResize();
	}

	$: outputHtml = canvasOutput ? marked(canvasOutput) : '';
</script>

<div class="input-panel flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
	<!-- Output area -->
	<div class="flex-1 overflow-y-auto p-4">
		<h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Canvas Output</h3>

		{#if isExecuting}
			<div class="flex items-center justify-center py-8">
				<div class="flex flex-col items-center gap-3">
					<Spinner className="size-8" />
					<span class="text-sm text-gray-600 dark:text-gray-400">Executing canvas flow...</span>
				</div>
			</div>
		{:else if canvasOutput}
			<div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
				<div class="prose dark:prose-invert max-w-none text-sm">
					{@html outputHtml}
				</div>
			</div>
		{:else}
			<div class="text-sm text-gray-500 dark:text-gray-400 italic">
				<p class="mb-3">No output yet. To execute the canvas:</p>
				<ol class="list-decimal list-inside space-y-2 text-xs">
					<li>Add agent nodes to the canvas</li>
					<li>Assign a model to each agent node</li>
					<li>Connect nodes to create a flow</li>
					<li>Add an output node (optional but recommended)</li>
					<li>Enter your input below and click execute</li>
				</ol>
			</div>
		{/if}
	</div>

	<!-- Input area -->
	<div class="border-t border-gray-200 dark:border-gray-700 p-4">
		<div class="flex flex-col gap-2">
			<label class="text-xs font-medium text-gray-700 dark:text-gray-300">
				User Input (will be sent to first node)
			</label>
			<div class="relative">
				<textarea
					bind:this={textArea}
					bind:value={userInput}
					on:keydown={handleKeyDown}
					on:input={autoResize}
					placeholder="Enter your prompt here..."
					class="w-full px-3 py-2 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
					rows="3"
					disabled={isExecuting}
				></textarea>
				<button
					class="absolute bottom-2 right-2 p-2 rounded-lg transition-colors {userInput.trim() && !isExecuting
						? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
						: 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'}"
					on:click={handleSubmit}
					disabled={!userInput.trim() || isExecuting}
					title="Execute Canvas (Enter)"
				>
					{#if isExecuting}
						<Spinner className="size-5" />
					{:else}
						<ArrowUpCircle className="size-5" />
					{/if}
				</button>
			</div>
			<div class="text-xs text-gray-500 dark:text-gray-400">
				Press Enter to execute, Shift+Enter for new line
			</div>
		</div>
	</div>
</div>

<style>
	.input-panel {
		width: 100%;
		max-width: 400px;
	}

	:global(.prose) {
		color: inherit;
	}

	:global(.prose p) {
		margin-bottom: 0.75rem;
	}

	:global(.prose code) {
		background-color: rgba(0, 0, 0, 0.05);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	:global(.dark .prose code) {
		background-color: rgba(255, 255, 255, 0.1);
	}
</style>
