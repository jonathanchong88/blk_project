import db from '../../../db';
import { authenticateToken } from '../../../middleware/auth';
import { cors } from '../../../middleware/cors';

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).end();

  const user = authenticateToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });

  try {
    // Get current user password to verify
    const { data: dbUser, error } = await db.from('users')
        .select('password')
        .eq('id', user.id)
        .single();

    if (error || !dbUser) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    // IMPORTANT: In production, use bcrypt.compare(currentPassword, dbUser.password)
    if (dbUser.password !== currentPassword) {
        return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Update to new password
    // IMPORTANT: In production, hash newPassword
    const { error: updateError } = await db.from('users').update({
        password: newPassword
    }).eq('id', user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password changed successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
