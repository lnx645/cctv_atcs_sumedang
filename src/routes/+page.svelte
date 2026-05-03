<script lang="ts">
	import ChatBox from '../components/chat-box.svelte';
	import Chatbox from '../components/chatbox.svelte';
	import Player from '../components/player.svelte';
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

<div class="container mx-auto lg:px-4">
	<div class="items-start gap-4 lg:flex">
		<div class="flex-1">
			<div class="aspect-video h-full w-full overflow-hidden lg:rounded">
				{#if cctv_detail}
					<Player title={cctv_detail?.nama as string} source={cctv_detail?.url as string} />
				{:else}
					<h2>Loading...</h2>
				{/if}
			</div>
			<div class="mt-4 px-3 lg:px-0">
				<h1 class="text-lg font-semibold">{cctv_detail?.nama}</h1>
				<div class="mt-3 flex items-center gap-2">
					<div
						class="flex aspect-square h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-stone-500 select-none"
					>
						<img class="select-none" src="https://atcs.sumedangkab.go.id/img/logoatcs.png" alt="" />
					</div>
					<div class="flex flex-col gap-0.5 text-xs text-stone-400">
						<span class="text-sm font-semibold text-stone-50">ATCS Dishub Sumedang</span>
						<span>1.2rb penonton • <span class="font-bold text-green-500">ATCS Live</span></span>
					</div>
				</div>
			</div>
			<div class="mt-4 px-3 lg:px-0">
				<div class="block lg:flex items-start gap-2">
					<div class="lg:mb-6 mb-2 rounded-lg bg-stone-800 p-3 text-xs">
						<p>
							Area Traffic Control System atau yang lebih dikenal dengan istilah ATCS adalah suatu
							sistem pengendalian lalu lintas berbasis teknologi informasi pada suatu kawasan yang
							bertujuan untuk mengoptimalkan kinerja jaringan jalan melalui optimasi dan koordinasi
							pengaturan lampu lalu lintas di setiap persimpangan. ATCS terdiri dari beberapa sistem
							utama yaitu :
						</p>
					</div>
					<div class="mb-6 lg:max-w-xs lg:min-w-xs rounded-lg bg-stone-800 p-3 text-sm">
						<h2  class="font-bold mb-2">Live Chat</h2>
						<p class="text-xs">
							Gabung ke percakapan untuk berinteraksi dengan kreator dan pengguna lain yang menonton
							live stream ini.
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="mx-auto w-full px-3 lg:max-w-md lg:px-0">
			<div class="mb-4">
				<Chatbox/>
			</div>
			<div class="lists h-125 overflow-y-auto">
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
	.lists::-webkit-scrollbar {
		display: none;
	}
</style>
