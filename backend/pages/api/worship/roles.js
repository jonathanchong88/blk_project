import db from '../../../db';
import { cors, runMiddleware } from '../../../middleware/cors';

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  try {
    const { data, error } = await db.from('worship_roles').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}