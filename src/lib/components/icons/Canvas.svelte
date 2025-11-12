<script lang="ts">
	export let className = 'size-4';
	export let strokeWidth = '1.5';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	fill="none"
	viewBox="0 0 24 24"
	stroke-width={strokeWidth}
	stroke="currentColor"
	class={className}
>
	<!-- Canvas background -->
	<rect x="2" y="2" width="20" height="20" rx="2" />

	<!-- Node 1 -->
	<circle cx="7" cy="7" r="2" fill="currentColor" />

	<!-- Node 2 -->
	<circle cx="17" cy="7" r="2" fill="currentColor" />

	<!-- Node 3 -->
	<circle cx="12" cy="17" r="2" fill="currentColor" />

	<!-- Connection lines -->
	<path d="M 8.5 8 L 10.5 16" stroke-width="1" />
	<path d="M 15.5 8 L 13.5 16" stroke-width="1" />
</svg>
