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
                .select('id, username, name, age, address, phone, avatar_url')
                .order('id', { ascending: true });

            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}