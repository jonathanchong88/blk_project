const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');

export default async function handler(req, res) {
    const user = await authenticateToken(req);
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Database query error in news/[id].js:', error);
                return res.status(500).json({ error: error.message });
            }
            if (!data) return res.status(404).json({ message: 'News not found' });
            return res.json(data);
        } catch (err) {
            console.error('Unhandled error in news GET by id:', err);
            return res.status(500).json({ error: err.message });
        }

    } else if (req.method === 'PUT') {
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userError || !['admin', 'editor', 'developer'].includes(userData?.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        const { title, description, image_url, date_from, date_to, documents } = req.body;
        if (!title || !date_from) {
            return res.status(400).json({ message: 'Title and Date From are required' });
        }

        try {
            const { data, error } = await supabase
                .from('news')
                .update({
                    title,
                    description,
                    image_url: image_url || null,
                    date_from,
                    date_to: date_to || null,
                    documents: documents || [],
                })
                .eq('id', id)
                .select();

            if (error) throw error;
            return res.json(data[0]);
        } catch (err) {
            console.error('Error updating news:', err);
            return res.status(500).json({ error: err.message });
        }

    } else if (req.method === 'DELETE') {
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userError || !['admin', 'editor', 'developer'].includes(userData?.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }

        try {
            const { error } = await supabase
                .from('news')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return res.status(204).end();
        } catch (err) {
            console.error('Error deleting news:', err);
            return res.status(500).json({ error: err.message });
        }

    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
