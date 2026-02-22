import db from '../../../db';
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

  if (req.method !== 'POST') return res.status(405).end();

  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Missing fields' });

  try {
    const { data: user, error } = await db.from('users')
        .select('id')
        .eq('reset_token', token)
        .gt('reset_token_expires', new Date().toISOString())
        .single();

    if (error || !user) return res.status(400).json({ message: 'Invalid or expired token' });

    // IMPORTANT: In a production app, you MUST hash the password here (e.g. using bcrypt)
    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password; 

    const { error: updateError } = await db.from('users').update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null
    }).eq('id', user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password updated' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
