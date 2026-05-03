<script lang="ts">
    import { Channel, StreamChat, type MessageResponse } from 'stream-chat';
    import { onMount, tick } from 'svelte';
    import UserCog from './icons/user-cog.svelte';
    import { fly, fade } from 'svelte/transition';

    // State Svelte 5
    let currentUserId = $state('');
    let messages = $state<MessageResponse[]>([]);
    let inputMessage = $state('');
    let showSettings = $state(false);
    let newName = $state('');
    let scrollContainer: HTMLDivElement;

    // svelte-ignore non_reactive_update
    let client: StreamChat;
    let channel: Channel;

    // Fungsi Scroll Otomatis
    async function scrollToBottom() {
        await tick();
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }

    onMount(async () => {
        // 1. Inisialisasi User dari LocalStorage atau Baru
        let savedUser = localStorage.getItem('chat_session');
        let userObj = savedUser ? JSON.parse(savedUser) : null;

        if (!userObj) {
            const uid = crypto.randomUUID().slice(0, 8);
            userObj = {
                id: `user-${uid}`,
                name: `Guest-${uid.slice(0, 4)}`,
                image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`
            };
            localStorage.setItem('chat_session', JSON.stringify(userObj));
        }

        currentUserId = userObj.id;
        newName = userObj.name;

        // 2. Setup Stream Chat
        const role = userObj.id === 'user-d44e07e2' ? 'admin' : 'user';

        const response = await fetch('/api/token', {
            method: 'POST',
            body: JSON.stringify({
                userId: userObj.id,
                userName: userObj.name,
                role: role,
                image: userObj.image
            })
        });

        const { token } = await response.json();
        client = StreamChat.getInstance('zakk5t4tpx6r');

        await client.connectUser({
            id: userObj.id,
            name: userObj.name,
            image: userObj.image,
            role: role
        }, token);

        channel = client.channel('messaging', 'public');
        const state = await channel.watch();
        messages = state.messages;

        scrollToBottom();

        // 3. Event Listeners
        channel.on((event: any) => {
            if (event.type === 'message.new') {
                messages = [...messages, event.message];
                scrollToBottom();
            }
            if (event.type === 'message.deleted') {
                messages = messages.filter((m) => m.id !== event.message.id);
            }
            if (event.type === 'user.updated') {
                // Update UI jika ada user yang ganti profil
                messages = messages.map(m => {
                    if (m.user?.id === event.user.id) {
                        return { ...m, user: event.user };
                    }
                    return m;
                });
            }
        });
    });

    // Fungsi Kirim Pesan
    async function send() {
        if (!inputMessage.trim() || !channel) return;
        try {
            await channel.sendMessage({ text: inputMessage });
            inputMessage = '';
            scrollToBottom();
        } catch (err) {
            console.error(err);
        }
    }

    // Fungsi Hapus Pesan
    async function deleteMessage(messageId: string) {
        if (!confirm('Hapus pesan ini?')) return;
        try {
            await client.deleteMessage(messageId);
        } catch (error) {
            alert('Gagal menghapus: Anda bukan moderator/admin.');
        }
    }

    // Fungsi Update Akun
    async function updateAccount() {
        if (!newName.trim()) return;
        const newImage = `https://api.dicebear.com/7.x/adventurer/svg?seed=${newName}`;

        try {
            await client.upsertUser({
                id: currentUserId,
                name: newName,
                image: newImage
            });

            localStorage.setItem('chat_session', JSON.stringify({
                id: currentUserId,
                name: newName,
                image: newImage
            }));

            showSettings = false;
        } catch (err) {
			console.log(err);

            alert('Gagal memperbarui profil');
        }
    }
</script>

<div class="relative overflow-hidden rounded border border-stone-600 bg-stone-800 shadow-xl">

    <!-- HEADER -->
    <div class="flex items-center justify-between border-b border-stone-600 p-3 text-sm">
        <h2 class="font-bold text-white">Live Chat</h2>
        <button
            onclick={() => showSettings = !showSettings}
            class="cursor-pointer text-stone-400 hover:text-white transition-colors"
        >
            <UserCog />
        </button>
    </div>

    <!-- POPUP PENGATURAN AKUN -->
    {#if showSettings}
        <div
            transition:fade={{ duration: 150 }}
            class="absolute inset-0 z-50 flex items-center justify-center bg-stone-900/90 p-4 backdrop-blur-sm"
        >
            <div
                transition:fly={{ y: 10, duration: 200 }}
                class="w-full max-w-xs rounded-lg border border-stone-500 bg-stone-800 p-6 shadow-2xl"
            >
                <div class="mb-4 flex flex-col items-center">
                    <div class="mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-red-700 bg-stone-700">
                        <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${newName}`} alt="Avatar Preview" />
                    </div>
                    <h3 class="text-lg font-bold text-white">Update Profil</h3>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-[10px] font-bold uppercase text-stone-400" for="name">Nama</label>
                        <input
                            id="name"
                            bind:value={newName}
                            type="text"
                            class="w-full rounded border border-stone-600 bg-stone-900 p-2 text-white outline-none focus:border-red-700"
                        />
                    </div>

                    <div class="flex gap-2">
                        <button
                            onclick={updateAccount}
                            class="flex-1 rounded bg-red-800 py-2 text-sm font-bold text-white hover:bg-red-700"
                        >
                            SIMPAN
                        </button>
                        <button
                            onclick={() => showSettings = false}
                            class="flex-1 rounded bg-stone-700 py-2 text-sm font-bold text-white hover:bg-stone-600"
                        >
                            BATAL
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- DAFTAR PESAN -->
    <div
        bind:this={scrollContainer}
        class="flex max-h-125 min-h-125 flex-col overflow-y-auto p-4 scroll-smooth"
    >
        {#each messages as msg (msg.id)}
            {#if !msg.deleted_at}
                <div
                    transition:fly={{ y: 15, duration: 300 }}
                    class="group mb-4 flex items-start gap-3 text-[rgba(255,255,255,0.8)]"
                >
                    <!-- Avatar -->
                    <div class="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-stone-700">
                        <img class="h-full w-full object-cover" src={msg.user?.image} alt="" />
                    </div>

                    <!-- Konten -->
                    <div class="flex flex-1 flex-col">
                        <div class="flex items-center gap-2 text-xs font-semibold">
                            <span class:admin={msg.user?.role === 'admin'}>
                                {msg.user?.name}
                            </span>
                            {#if msg.user?.role === 'admin'}
                                <span class="rounded bg-red-900/30 px-1 text-[9px] text-red-500 uppercase">Admin</span>
                            {/if}

                            <!-- Tombol Hapus (Hanya muncul saat hover & jika punya akses) -->
                            {#if msg.user?.id === currentUserId || client?.user?.role === 'admin'}
                                <button
                                    onclick={() => deleteMessage(msg.id)}
                                    class="ml-auto hidden text-[10px] text-red-500 opacity-60 hover:opacity-100 group-hover:block"
                                >
                                    Hapus
                                </button>
                            {/if}
                        </div>
                        <p class="mt-0.5 text-[13px] leading-relaxed text-white">
                            {msg.text}
                        </p>
                    </div>
                </div>
            {/if}
        {/each}
    </div>

    <!-- INPUT BOX -->
    <div class="flex items-center gap-3 border-t border-t-stone-600 bg-stone-900 p-2">
        <textarea
            bind:value={inputMessage}
            placeholder="Ketik pesan..."
            onkeydown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                }
            }}
            class="w-full resize-none bg-transparent px-2 py-1 text-[13px] text-white outline-none placeholder:text-stone-500"
            rows="1"
        ></textarea>
        <button
            onclick={send}
            class="h-full cursor-pointer rounded bg-red-800 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 active:scale-95"
        >
            SEND
        </button>
    </div>
</div>

<style>
    .admin {
        color: #ff4d4d; /* Warna merah untuk admin agar menonjol */
    }

    /* Kustomisasi Scrollbar agar estetik */
    ::-webkit-scrollbar {
        width: 4px;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }
    ::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #666;
    }
</style>
