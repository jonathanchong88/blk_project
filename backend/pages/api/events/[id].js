const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
const { cors, runMiddleware } = require('../../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = authenticateToken(req);

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) return res.status(404).json({ message: 'Event not found' });
            
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'DELETE') {
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

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