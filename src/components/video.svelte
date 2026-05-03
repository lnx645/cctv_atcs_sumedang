<script lang="ts">
	import Hls from 'hls.js';
	import { onDestroy, onMount } from 'svelte';
	import type { Action } from 'svelte/action';
	import Live from './icons/live.svelte';
	import Play from './icons/play.svelte';
	import Volume from './icons/volume.svelte';
	let {
		source,
		title
	}: {
		title: string;
		source: string;
	} = $props();
	let video_el = $state<HTMLVideoElement | null>(null);
	const video = (node: HTMLMediaElement) => {
		let hls: Hls;
		$effect(() => {
			if (Hls.isSupported()) {
				hls = new Hls();
				hls.loadSource(source);
				hls.attachMedia(node);
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					node.play().catch(() => console.log('WKWKW'));
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
			}
			return () => {
				if (hls) {
					hls.destroy();
				}
			};
		});
	};
	function onWaiting(e: Event) {
		console.log(e);
	}
	onMount(() => {
		if (video_el) {
			video_el.addEventListener('waiting', onWaiting);
		}
		return () => {
			if (video_el) {
				video_el.removeEventListener('waiting', onWaiting);
			}
		};
	});
	onDestroy(() => {
		if (video_el) {
			video_el.removeEventListener('waiting', onWaiting);
		}
	});
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<div class="relative">
	<video
		controls={true}
		autoplay={false}
		bind:this={video_el}
		muted
		class="aspect-video h-full w-full"
		use:video
	></video>
	<div class="absolute top-0 p-2">
		<div class="flex w-full items-center">
			<div class="ml-auto flex items-center space-x-1 rounded-lg bg-stone-600 p-2 py-1 text-xs">
				<Live />
				<span>LIVE</span>
			</div>
		</div>
	</div>
</div>
