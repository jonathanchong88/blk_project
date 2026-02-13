const bcrypt = require('bcryptjs');
const supabase = require('../../db');
const { cors, runMiddleware } = require('../../middleware/cors');

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, password } = req.body;
    try {
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username);

        if (checkError) throw checkError;
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const { error: insertError } = await supabase
            .from('users')
            .insert([{ username, password: hashedPassword, role: 'member' }]);

        if (insertError) throw insertError;
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}