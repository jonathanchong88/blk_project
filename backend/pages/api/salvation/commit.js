const db = require('../../../db');
export default async function handler(req, res) {

  if (req.method !== 'POST') return res.status(405).end();

  const { first_name, last_name, email, phone, decision_type } = req.body;

  if (!first_name || !last_name || !email || !decision_type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const { error } = await db
      .from('salvation_commitments')
      .insert({ first_name, last_name, email, phone, decision_type });

    if (error) throw error;

    res.status(201).json({ message: 'Commitment recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}