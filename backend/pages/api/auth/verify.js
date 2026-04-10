import db from '../../../db';
import { cors, runMiddleware } from '../../../middleware/cors';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') return res.status(405).end();

  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Missing fields' });

  try {
    const { data: { users }, error: authError } = await db.auth.admin.listUsers();
    
    if (authError) throw authError;

    const authUser = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (!authUser) return res.status(404).json({ message: 'User not found' });

    const { data: user, error } = await db.from('users')
        .select('id, verification_code')
        .eq('auth_id', authUser.id)
        .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });

    if (user.verification_code !== code) {
        return res.status(400).json({ message: 'Invalid verification code' });
    }

    const { error: updateError } = await db.from('users').update({
        is_verified: true,
        verification_code: null
    }).eq('id', user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Email verified successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
