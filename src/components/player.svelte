<script lang="ts">
	// Import bundle untuk meregistrasi custom elements Vidstack
	import 'vidstack/bundle';
	// Import CSS standar agar kontrol default muncul dan rapi
	import 'vidstack/player/styles/default/theme.css';
	import 'vidstack/player/styles/default/layouts/video.css';
	let {
		source,
		title
	}: {
		title: string;
		source: string;
	} = $props();
	let hlsConfig = $state({
		enableWorker: true,
		fragLoadingMaxRetry: 5,
		fragLoadingRetryDelay: 1000
	});
</script>

<media-player
	{title}
	on:hls-frag-parsed={() => {
		console.log('WKWKW');
	}}
	src={source}
	playsinline
	muted
	autoplay
>
	<media-provider> </media-provider>
	<media-video-layout> </media-video-layout>
</media-player>
