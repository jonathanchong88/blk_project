const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const { cors, runMiddleware } = require('../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
        try {
            // Fetch all events, ordered by date
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });

            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        const { title, date, description, location, image_url } = req.body;
        if (!title || !date) {
            return res.status(400).json({ message: 'Title and Date are required' });
        }

        try {
            const { data, error } = await supabase
                .from('events')
                .insert([{
                    title,
                    date,
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