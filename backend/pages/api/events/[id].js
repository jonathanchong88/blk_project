const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
export default async function handler(req, res) {

    const user = await authenticateToken(req);

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*, event_likes(count)')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Database query error in events/[id].js:', error);
                return res.status(500).json({ error: error.message, details: error.details });
            }
            if (!data) return res.status(404).json({ message: 'Event not found' });
            
            let likesCount = 0;
            if (Array.isArray(data.event_likes)) {
                likesCount = data.event_likes[0]?.count || 0;
            } else if (data.event_likes && typeof data.event_likes === 'object') {
                likesCount = data.event_likes.count || 0;
            }

            const eventWithCount = {
                ...data,
                likes_count: likesCount
            };
            res.json(eventWithCount);
        } catch (err) {
            console.error('Unhandled error in individual event GET:', err);
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'PUT') {
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

        try {
            const { data, error } = await supabase
                .from('events')
                .update({ title, date, end_date: end_date || null, description, location, image_url })
                .eq('id', id)
                .select();

            if (error) throw error;
            res.json(data[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'DELETE') {
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

        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            res.status(204).end();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}