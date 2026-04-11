const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
export default async function handler(req, res) {

    const user = await authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('username, name, age, address, phone, avatar_url, role, is_active')
                .eq('id', id)
                .single();

            if (error) throw error;
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
                .eq('id', id)
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