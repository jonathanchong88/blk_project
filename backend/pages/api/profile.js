const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const { cors, runMiddleware } = require('../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, name, age, address, phone, avatar_url, role')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
                throw error;
            }

            if (!data) return res.status(404).json({ message: 'Profile not found' });

            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'PUT') {
        const { name, age, address, phone, avatar_url, role } = req.body;
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ name, age, address, phone, avatar_url, role })
                .eq('id', user.id)
                .select();

            if (error) throw error;
            res.json(data[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}