import db from '../../../db';
import { cors } from '../../../middleware/cors';
import crypto from 'crypto';

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

  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    // Check if user exists
    const { data: user } = await db.from('users').select('id').eq('email', email).single();
    
    // Even if user doesn't exist, we return success to prevent email enumeration
    if (!user) {
        return res.json({ message: 'If email exists, link sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    const { error } = await db.from('users').update({
        reset_token: token,
        reset_token_expires: expires.toISOString()
    }).eq('id', user.id);

    if (error) throw error;

    // In a real app, you would send an email here using SendGrid, Resend, etc.
    // For this implementation, we return the link in the response for testing.
    const link = `${req.headers.origin || 'http://localhost:3000'}/reset-password?token=`;
    
    res.json({ message: 'Link sent', testLink: link });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
