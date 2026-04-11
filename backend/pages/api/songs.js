const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
export default async function handler(req, res) {

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .order('title', { ascending: true });

            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        const user = await authenticateToken(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // Optional: Check role permissions here if needed

        const { title, author, locale, lyrics, image_url, video_url, music_sheet_url, music_sheet_files } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        try {
            const { data, error } = await supabase
                .from('songs')
                .insert([{ title, author, locale, lyrics, image_url, video_url, music_sheet_url, music_sheet_files: music_sheet_files || [] }])
                .select();

            if (error) throw error;
            res.status(201).json(data[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}