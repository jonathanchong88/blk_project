const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');
const { cors, runMiddleware } = require('../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = await authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
        try {
            // Check if requester is authorized (admin/developer/editor)
            if (!['admin', 'developer', 'editor'].includes(user.role)) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            const { data, error } = await supabase
                .from('users')
                .select('id, username, name, age, address, phone, avatar_url, role, is_active, email')
                .order('is_active', { ascending: true })
                .order('id', { ascending: false });

            if (error) throw error;
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}