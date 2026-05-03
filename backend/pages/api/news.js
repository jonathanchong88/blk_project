const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .order('date_from', { ascending: false });

            if (error) {
                console.error('Database query error in news.js:', error);
                return res.status(500).json({ error: error.message });
            }
            return res.json(data || []);
        } catch (err) {
            console.error('Unhandled error in news GET:', err);
            return res.status(500).json({ error: err.message });
        }

    } else if (req.method === 'POST') {
        const user = await authenticateToken(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // member role cannot create news
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
                .insert([{
                    title,
                    description,
                    image_url: image_url || null,
                    date_from,
                    date_to: date_to || null,
                    documents: documents || [],
                    user_id: user.id,
                }])
                .select();

            if (error) throw error;
            return res.status(201).json(data[0]);
        } catch (err) {
            console.error('Error creating news:', err);
            return res.status(500).json({ error: err.message });
        }

    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
