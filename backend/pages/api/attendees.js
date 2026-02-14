const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const { cors, runMiddleware } = require('../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    if (req.method === 'GET') {
        const { event_id } = req.query;
        if (!event_id) return res.status(400).json({ message: 'Event ID required' });

        try {
            const { data, error } = await supabase
                .from('event_attendees')
                .select('user_id, users(id, username, name, avatar_url)')
                .eq('event_id', event_id);

            if (error) throw error;
            
            // Flatten the structure to return a list of users
            const attendees = data.map(item => item.users);
            res.json(attendees);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        const user = authenticateToken(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { event_id } = req.body;
        try {
            const { data: existing, error: checkError } = await supabase
                .from('event_attendees')
                .select('*')
                .eq('user_id', user.id)
                .eq('event_id', event_id)
                .single();

            if (existing) {
                await supabase.from('event_attendees').delete().eq('user_id', user.id).eq('event_id', event_id);
                res.json({ attending: false });
            } else {
                await supabase.from('event_attendees').insert([{ user_id: user.id, event_id }]);
                res.json({ attending: true });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}