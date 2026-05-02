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
</script>

<media-player {title} src={source} playsinline muted autoplay>
	<media-provider>
		<track src="/subs/english.vtt" label="English" kind="subtitles" srclang="en" />
	</media-provider>
	<media-video-layout>

	</media-video-layout>
</media-player>
