import { StreamChat } from 'stream-chat';
import { json } from '@sveltejs/kit';
const STREAM_KEY = 'zakk5t4tpx6r';
const STREAM_SECRET = 'e7zk7pcdugt5hqregkt7nzq36rjt972948es9q7tthuyzf9b2g37da9dzt8zadaj';

export const POST = async ({ request }) => {
    try {
        const { userId, userName, role, image } = await request.json();
        const serverClient = StreamChat.getInstance(STREAM_KEY, STREAM_SECRET);

        await serverClient.upsertUser({ id: userId, name: userName, role: role, image: image });

        const channel = serverClient.channel('messaging', 'public');

        await channel.addMembers([userId]);

        const token = serverClient.createToken(userId);
        return json({ token });
    } catch (err) {
        console.error("Detail Server Error:", err);
        return json({ error: "Gagal generate token", err }, { status: 500 });
    }
};
