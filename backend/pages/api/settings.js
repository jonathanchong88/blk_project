const supabase = require('../../db');
const { authenticateToken } = require('../../middleware/auth');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ message: 'key query parameter is required' });
        }

        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key_name', key)
                .single();

            if (error) {
                // If row doesn't exist, Supabase returns PGRST116. We can just return empty settings.
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ message: 'Setting not found' });
                }
                return res.status(500).json({ error: error.message });
            }

            res.status(200).json(data.value);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
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

        const { key, value } = req.body;
        if (!key || !value) {
            return res.status(400).json({ message: 'key and value are required' });
        }

        try {
            const { data, error } = await supabase
                .from('site_settings')
                .upsert({
                    key_name: key,
                    value: value,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key_name' })
                .select();

            if (error) throw error;
            res.status(200).json(data[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }

    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
