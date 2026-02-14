const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const { cors, runMiddleware } = require('../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = authenticateToken(req);

    if (req.method === 'GET') {
        try {
            // Fetch all events, ordered by date
            const { data, error } = await supabase
                .from('events')
                .select('*, event_likes(count)')
                .order('date', { ascending: true });

            if (error) throw error;
            
            const eventsWithCounts = data.map(event => ({
                ...event,
                likes_count: event.event_likes[0]?.count || 0
            }));
            res.json(eventsWithCounts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userError || !['admin', 'editor', 'developer'].includes(userData.role)) {
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }

        const { title, date, end_date, description, location, image_url } = req.body;
        if (!title || !date) {
            return res.status(400).json({ message: 'Title and Date are required' });
        }

        try {
            const { data, error } = await supabase
                .from('events')
                .insert([{
                    title,
                    date,
                    end_date: end_date || null,
                    description,
                    location,
                    image_url,
                    user_id: user.id
                }])
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