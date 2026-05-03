import db from '../../../db';
import { authenticateToken } from '../../../middleware/auth';
export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const { data, error } = await db
                .from('songs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) return res.status(404).json({ message: 'Song not found' });
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'PUT') {
        const user = await authenticateToken(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { title, author, locale, lyrics, image_url, video_url, music_sheet_url, music_sheet_files } = req.body;
        try {
            const { data, error } = await db
                .from('songs')
                .update({ title, author, locale, lyrics, image_url, video_url, music_sheet_url, music_sheet_files: music_sheet_files || [] })
                .eq('id', id)
                .select();

            if (error) throw error;
            res.json(data[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'DELETE') {
        const user = await authenticateToken(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        try {
            const { error } = await db.from('songs').delete().eq('id', id);
            if (error) throw error;
            res.status(204).end();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}