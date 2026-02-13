const supabase = require('../../db');
const { cors, runMiddleware } = require('../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('roles')
                .select('*')
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