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

  const { email, password, username, name, phone } = req.body;
  if (!email || !password || !username) return res.status(400).json({ message: 'Missing fields' });

  try {
    // Check if user exists
    const { data: existingUser } = await db.from('users').select('id').or(`email.eq.${email},username.eq.`).single();
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Generate 4-digit code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const { error } = await db.from('users').insert({
      email,
      password, // Note: In production, you should hash this password!
      username,
      name,
      phone,
      verification_code: verificationCode,
      is_verified: false,
      is_active: true
    });

    if (error) throw error;

    // Mock sending email - In production, integrate with an email service provider here
    console.log(`DEV MODE: Verification code for  is `);

    res.status(201).json({ message: 'User created. Please verify your email.', testCode: verificationCode });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
