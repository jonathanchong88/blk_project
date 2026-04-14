const supabase = require('../../../db');
const { authenticateToken } = require('../../../middleware/auth');

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: 'Invalid entry ID' });
    }

    if (req.method === 'PUT') {
        // Admin-only: update a welcome entry
        const user = await authenticateToken(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userError || !['admin', 'developer'].includes(userData.role)) {
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }

        const {
            order_index,
            image_url,
            en_subtitle, en_title, en_text, en_author,
            zh_subtitle, zh_title, zh_text, zh_author,
            is_active
        } = req.body;

        if (!en_title || !en_text) {
            return res.status(400).json({ message: 'English title and text are required.' });
        }

        try {
            const { data, error } = await supabase
                .from('welcome_entries')
                .update({
                    order_index: order_index ?? 0,
                    image_url: image_url || null,
                    en_subtitle: en_subtitle || null,
                    en_title,
                    en_text,
                    en_author: en_author || null,
                    zh_subtitle: zh_subtitle || null,
                    zh_title: zh_title || null,
                    zh_text: zh_text || null,
                    zh_author: zh_author || null,
                    is_active: is_active !== false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (!data) return res.status(404).json({ message: 'Entry not found' });
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }

    } else if (req.method === 'DELETE') {
        // Admin-only: delete a welcome entry
        const user = await authenticateToken(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userError || !['admin', 'developer'].includes(userData.role)) {
                return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
            }
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }

        try {
            const { error } = await supabase
                .from('welcome_entries')
                .delete()
                .eq('id', id);

            if (error) throw error;
            res.status(200).json({ message: 'Entry deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }

    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
