<script lang="ts">
	import Hls from 'hls.js';
	import type { Action } from 'svelte/action';
	let {
		source
	}: {
		source: string;
	} = $props();

	const video: Action = (node: HTMLMediaElement | any) => {
		let hls: Hls;
		$effect(() => {
			if (Hls.isSupported()) {
				hls = new Hls();
				hls.loadSource(source);
				hls.attachMedia(node);
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					node.play().catch((e: any) => console.log('Autoplay dicegah browser'));
				});
				hls.on(Hls.Events.ERROR, (event, data) => {
					if (data.fatal) {
						switch (data.type) {
							case Hls.ErrorTypes.NETWORK_ERROR:
								hls.startLoad();
								break;
							case Hls.ErrorTypes.MEDIA_ERROR:
								hls.recoverMediaError();
								break;
							default:
								hls.destroy();
								break;
						}
					}
				});
			} else if (node.canPlayType('application/vnd.apple.mpegurl')) {
				node.src = source;
			}
			return () => {
				if (hls) {
					hls.destroy();
				}
			};
		});
	};
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<video class="aspect-video h-full w-full" controls use:video></video>
