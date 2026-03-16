const db = require('../../../db');
const { cors, runMiddleware } = require('../../../middleware/cors');

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') return res.status(405).end();

  const { first_name, last_name, email, decision_type } = req.body;

  if (!first_name || !last_name || !email || !decision_type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const { error } = await db
      .from('salvation_commitments')
      .insert({ first_name, last_name, email, decision_type });

    if (error) throw error;

    res.status(201).json({ message: 'Commitment recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}