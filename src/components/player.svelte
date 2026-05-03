<script lang="ts">
	import 'vidstack/icons';
	import type { MediaPlayerElement } from 'vidstack/elements';
	import 'vidstack/bundle';
	import 'vidstack/player/styles/plyr/theme.css';
	import 'vidstack/player/styles/default/layouts/video.css';
	import { onDestroy, onMount } from 'svelte';
	let {
		source,
		title
	}: {
		title: string;
		source: string;
	} = $props();

	let player: MediaPlayerElement;

	onDestroy(() => {
		player.destroy();
	});
	onMount(() => {
		console.log(player);
	});
	let myHlsConfig = $state({
		enableWorker: true,
		lowLatencyMode: true,

		// 1. Atasi Buffer Stalled
		// Memberikan toleransi lebih besar agar tidak gampang dianggap 'error'
		maxBufferLength: 10,
		maxMaxBufferLength: 20,

		// 2. Gap Controller (PENTING untuk log kamu)
		// Jika ada celah kecil (gap) di buffer, hls.js akan mencoba melompatinya
		skipReadyStateFilters: true,
		nudgeOffset: 0.1,
		nudgeMaxRetry: 10,

		// 3. Kecepatan Download
		// Mempercepat timeout agar jika satu fragmen lambat, langsung coba lagi
		fragLoadingTimeOut: 10000,
		fragLoadingRetryDelay: 500,
		fragLoadingMaxRetry: 10
	});
	function setupPlayer(node: any) {
		node.hlsConfig = myHlsConfig;
	}
</script>

<media-player
	streamType="live:dvr"
	poster="https://d1csarkz8obe9u.cloudfront.net/posterpreviews/youtube-thumbnail-template-design-5fa9cd79a6367f8446a5208e4540a493_screen.jpg?ts=1699135222"
	playsinline
	use:setupPlayer
	keep-alive
	bind:this={player}
	{title}
	src={source}
	muted
	autoplay
>
	<media-provider> </media-provider>
	<media-video-layout> </media-video-layout>
</media-player>

<style>
	media-player,
	media-provider,
	video {
		border-radius: 0 !important;
		--media-radius: 0;
		--video-border-radius: 0;
	}

	/* Jika Anda menggunakan layout default, hilangkan juga radius di layernya */
	media-video-layout {
		--vds-video-border-radius: 0;
	}
</style>
