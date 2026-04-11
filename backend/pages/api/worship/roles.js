import db from '../../../db';

export default async function handler(req, res) {

  try {
    const { data, error } = await db.from('worship_roles').select('*').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}