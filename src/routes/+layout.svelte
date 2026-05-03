<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<nav class="h-14 w-full sticky z-50 top-0 border-b-2 bg-stone-900 border-stone-800 text-white">
	<div class="container mx-auto px-4">
		<div class="flex h-14 w-full items-center">
			<h2>SUMEDANG CCTV</h2>
		</div>
	</div>
</nav>
<div class="mt-4">
	{@render children()}
</div>
