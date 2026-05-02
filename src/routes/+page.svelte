<script lang="ts">
	import Player from '../components/player.svelte';
	import Video from '../components/video.svelte';
	import type { CCTVLocation } from '../types/cctv.js';

	let { data } = $props();
	let cctv_detail = $state<CCTVLocation>();
	let selected_id = $state(44);

	$effect(() => {
		if (selected_id) {
			let found = data.cctvs.find((cc) => cc.id === selected_id);
			if (found) {
				cctv_detail = found;
			}
		}
	});
</script>

<div class="container mx-auto px-4">
	<div class="items-start gap-4 lg:flex">
		<div class="flex-1">
			<div class="aspect-video h-full w-full overflow-hidden rounded">
				<Player title={cctv_detail?.nama as string} source={cctv_detail?.url as string}/>
			</div>
			<div class="mt-4">
				<h1 class="text-lg font-semibold">{cctv_detail?.nama}</h1>
				<div class="flex items-center gap-2 mt-3">
					<div class="aspect-square h-8 w-8 rounded-full flex items-center justify-center bg-white select-none overflow-hidden ring-1 ring-stone-500">
                        <img class="select-none" src="https://atcs.sumedangkab.go.id/img/logoatcs.png" alt="">
                    </div>
					<div class="flex gap-0.5 text-stone-400 flex-col text-xs">
						<span class="text-sm text-stone-50 font-semibold">ATCS Dishub Sumedang</span>
						<span>1.2rb penonton • <span class="text-green-500 font-bold">ATCS Live</span></span>
					</div>
				</div>
			</div>
            <div class="mt-4 text-sm bg-stone-800 p-3 rounded-lg mb-6">
                <p>
                    Area Traffic Control System atau yang lebih dikenal dengan istilah ATCS adalah suatu sistem pengendalian lalu lintas berbasis teknologi informasi pada suatu kawasan yang bertujuan untuk mengoptimalkan kinerja jaringan jalan melalui optimasi dan koordinasi pengaturan lampu lalu lintas di setiap persimpangan. ATCS terdiri dari beberapa sistem utama yaitu :
                </p>
            </div>
		</div>

		<div class="mx-auto w-full lg:max-w-lg">
			<div class="h-125 lists overflow-y-auto">
				{#each data.cctvs as cctv, id}
					<button
						onclick={() => {
							selected_id = cctv.id;
						}}
						class="flex w-full cursor-pointer items-start gap-3 border-y border-transparent px-2 py-1 text-sm"
						class:active={cctv.url === cctv_detail?.url}
					>
						<div>
							<span>{id + 1}</span>
						</div>
						<div class="flex items-center justify-center gap-1">
							<span>{cctv.nama}</span>
							&bullet;
							<span class="text-xs font-bold text-green-600">Online</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.active {
		background-color: rgb(98, 23, 23);
		border-color: #850000;
	}
    .lists::-webkit-scrollbar{
        display: none;
    }
</style>
