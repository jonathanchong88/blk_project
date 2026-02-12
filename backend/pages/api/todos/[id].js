const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');
const { cors, runMiddleware } = require('../../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    const user = authenticateToken(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.query;

    if (req.method === 'PUT') {
        const { task, completed } = req.body;
        try {
            const updates = {};
            if (task !== undefined) updates.task = task;
            if (completed !== undefined) updates.completed = completed;

            const { data, error } = await supabase
                .from('todos')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select();

            if (error) throw error;
            if (data.length === 0) return res.status(404).json({ message: 'Todo not found' });
            res.json(data[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { error, count } = await supabase
                .from('todos')
                .delete({ count: 'exact' })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) return res.status(500).json({ error: error.message });
            if (count > 0 || !error) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Todo not found' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}