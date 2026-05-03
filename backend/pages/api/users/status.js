import db from '../../../db';
import { authenticateToken } from '../../../middleware/auth';
export default async function handler(req, res) {
  const user = await authenticateToken(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (req.method === 'PUT') {
    const { user_id, is_active } = req.body;
    
    try {
        // Check if requester is authorized (admin/developer/editor)
        const { data: requester } = await db.from('users').select('role').eq('id', user.id).single();
        if (!['admin', 'developer', 'editor'].includes(requester.role)) {
             return res.status(403).json({ message: 'Forbidden' });
        }

        const { error } = await db
            .from('users')
            .update({ is_active })
            .eq('id', user_id);

        if (error) throw error;
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}