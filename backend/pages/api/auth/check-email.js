import db from '../../../db';

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const { data: { users }, error } = await db.auth.admin.listUsers();

        if (error) {
            throw error;
        }

        const emailExists = users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase());

        return res.status(200).json({ exists: emailExists });
    } catch (err) {
        console.error('Check Email Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
