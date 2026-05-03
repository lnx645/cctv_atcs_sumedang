<script lang="ts">
	import { StreamChat } from 'stream-chat';
	import { onMount, tick } from 'svelte';

	let client: StreamChat;
	let channel: any;
	let scrollContainer: HTMLDivElement;

	let messages = $state<any[]>([]);
	let inputMessage = $state('');
	let isReady = $state(false);
	let currentUserId = $state('');
	let currentUserName = $state('');
	let replyingTo = $state<any>(null);
	let unreadCount = $state(0);
	let isAtBottom = true;

	onMount(async () => {
		let savedUser = localStorage.getItem('chat_session');
		let userObj = savedUser ? JSON.parse(savedUser) : null;

		if (!userObj) {
			const uid = crypto.randomUUID().slice(0, 8);
			userObj = { id: `user-${uid}`, name: `Guest-${uid.slice(0, 4)}` };
			localStorage.setItem('chat_session', JSON.stringify(userObj));
		}
		currentUserId = userObj.id;
		currentUserName = userObj.name;
		try {
			const response = await fetch('/api/token', {
				method: 'POST',
				body: JSON.stringify({ userId: userObj.id, userName: userObj.name })
			});
			const { token } = await response.json();
			client = StreamChat.getInstance('zakk5t4tpx6r');
			await client.connectUser(userObj, token);
			channel = client.channel('messaging', 'public');
			const state = await channel.watch();
			messages = state.messages;
			isReady = true;
			scrollToBottom();

			channel.on((event: any) => {
				if (event.type === 'message.new') {
					const isOwnMessage = event.message.user.id === currentUserId;
					messages = [...messages, event.message];
					if (isAtBottom || isOwnMessage) {
						scrollToBottom();
					} else {
						unreadCount++;
					}
				} else if (event.type === 'message.deleted') {
					messages = messages.filter((m) => m.id !== event.message.id);
				}
			});
		} catch (err) {
			console.error('Chat error:', err);
		}
	});

	async function scrollToBottom() {
		await tick();
		if (scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
			unreadCount = 0;
		}
	}

	function handleScroll() {
		if (!scrollContainer) return;
		const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
		isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
		if (isAtBottom) unreadCount = 0;
	}

	async function send() {
		if (!inputMessage.trim() || !channel) return;

		const messageData: any = { text: inputMessage };
		if (replyingTo) {
			messageData.parent_id = replyingTo.id;
			messageData.show_in_channel = true;
		}

		await channel.sendMessage(messageData);
		inputMessage = '';
		replyingTo = null;
		scrollToBottom();
	}

	async function deleteMsg(id: string) {
		if (confirm('Hapus pesan ini?')) {
			await client.deleteMessage(id);
		}
	}

</script>

<div
	class="relative flex h-125 w-full lg:max-w-100 flex-col border border-stone-700 bg-stone-800 font-sans text-white shadow-xl"
>
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-stone-700 bg-stone-800 px-4 py-3 z-10">
		<h2 class="text-sm font-medium">Live Chat</h2>
		<div class="flex gap-2">
			<span class="rounded bg-red-600 px-1 text-[10px] font-bold uppercase">Live</span>
		</div>
	</div>

	<!-- Notif Pesan Baru (Floating) -->
	{#if unreadCount > 0}
		<button
			onclick={scrollToBottom}
			class="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 animate-bounce rounded-full border border-blue-400 bg-blue-600 px-3 py-1.5 text-[11px] text-white shadow-lg"
		>
			{unreadCount} pesan baru ↓
		</button>
	{/if}

	<!-- Area Pesan -->
	<div
		bind:this={scrollContainer}
		onscroll={handleScroll}
		class="scrollbar-thin scrollbar-thumb-stone-600 flex-1 overflow-y-auto p-2"
	>
		{#if !isReady}
			<div class="flex h-full items-center justify-center">
				<div class="h-6 w-6 animate-spin rounded-full border-2 border-stone-500 border-t-white"></div>
			</div>
		{:else}
			<div class="flex flex-col gap-1">
				{#each messages as msg}
					<div class="group relative flex items-start gap-3 rounded px-2 py-2 transition-colors hover:bg-stone-800/50">
						<!-- Avatar -->
						<div
							class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-stone-700 text-[10px] font-bold uppercase border border-stone-600"
						>
							{msg.user.name.charAt(0)}
						</div>

						<!-- Content -->
						<div class="flex flex-1 flex-col overflow-hidden pr-8">
							<div class="flex items-baseline gap-2 mb-0.5">
								<span class="text-[12px] font-semibold text-stone-400">
									{msg.user.name}
								</span>
								<span class="text-[10px] text-stone-500">
									{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</span>
							</div>

							<!-- Konten Reply jika ada parent -->
							{#if msg.parent_id}
								{@const parent = messages.find((m) => m.id === msg.parent_id)}
								<div class="mb-1 flex flex-col border-l-2 border-stone-600 bg-stone-900/50 py-1 pl-2 text-[11px] italic text-stone-500">
									<span class="font-bold text-blue-400">@{parent?.user?.name || 'user'}</span>
									<span class="truncate">{parent?.text || 'Pesan dihapus'}</span>
								</div>
							{/if}

							<p class="break-words text-[13px] leading-relaxed text-stone-200">
								{msg.text}
							</p>
						</div>

						<!-- Tombol Aksi (Absolute pojok kanan atas) -->
						<div class="absolute right-2 top-2 hidden group-hover:flex gap-2 bg-[#1f1f1f] p-1 rounded border border-stone-700 shadow-lg z-10">
							<button
								onclick={() => replyingTo = msg}
								class="text-[10px] font-bold text-blue-400 hover:text-blue-300 px-1"
							>
								BALAS
							</button>
							{#if msg.user.id === currentUserId}
								<button
									onclick={() => deleteMsg(msg.id)}
									class="text-[10px] font-bold text-red-500 hover:text-red-400 px-1"
								>
									HAPUS
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Input Area -->
	<div class="border-t border-stone-700 bg-[#0f0f0f] p-3">
		<!-- Preview Reply -->
		{#if replyingTo}
			<div class="mb-2 flex items-center justify-between rounded bg-stone-900 border-l-4 border-blue-500 p-2 text-[11px]">
				<div class="flex flex-col truncate">
					<span class="font-bold text-blue-400 uppercase">Membalas {replyingTo.user.name}</span>
					<span class="truncate text-stone-500 italic">"{replyingTo.text}"</span>
				</div>
				<button onclick={() => (replyingTo = null)} class="ml-2 text-lg text-stone-400 hover:text-white">&times;</button>
			</div>
		{/if}

		<div class="flex flex-col gap-2 rounded-lg bg-stone-800 p-2 focus-within:ring-1 focus-within:ring-stone-600">
			<div class="flex items-center gap-2">
				<div
					class="flex h-5 w-5 items-center justify-center rounded-full bg-stone-600 text-[10px] font-bold uppercase"
				>
					{currentUserName.charAt(0)}
				</div>
				<span class="text-[11px] font-medium text-stone-400">{currentUserName}</span>
			</div>

			<div class="flex items-end gap-2">
				<textarea
					bind:value={inputMessage}
					onkeydown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							send();
						}
					}}
					placeholder={replyingTo ? 'Tulis balasan...' : 'Ketik pesan...'}
					class="w-full resize-none bg-transparent px-1 text-[13px] text-white outline-none placeholder:text-stone-500"
					rows="1"
				></textarea>

				<button
					onclick={send}
					disabled={!inputMessage.trim()}
					class="rounded-full p-1 text-stone-400 transition-colors hover:text-blue-500 disabled:opacity-30"
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 rotate-90" viewBox="0 0 20 20" fill="currentColor">
						<path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.scrollbar-thin::-webkit-scrollbar {
		width: 4px;
	}
	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: #525252;
		border-radius: 10px;
	}
	.scrollbar-thin::-webkit-scrollbar-track {
		background: transparent;
	}
</style>
