const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const { cors, runMiddleware } = require('../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
        // Get list of event IDs liked by the user
        try {
            const { data, error } = await supabase
                .from('event_likes')
                .select('event_id')
                .eq('user_id', user.id);

            if (error) throw error;
            res.json(data.map(like => like.event_id));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        // Toggle like
        const { event_id } = req.body;
        try {
            // Check if like exists
            const { data: existingLike, error: checkError } = await supabase
                .from('event_likes')
                .select('*')
                .eq('user_id', user.id)
                .eq('event_id', event_id)
                .single();

            if (existingLike) {
                // Unlike
                await supabase.from('event_likes').delete().eq('user_id', user.id).eq('event_id', event_id);
                res.json({ liked: false });
            } else {
                // Like
                await supabase.from('event_likes').insert([{ user_id: user.id, event_id }]);
                res.json({ liked: true });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}