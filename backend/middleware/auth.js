const supabase = require('../db');

const authenticateToken = async (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return null;

    try {
        // Use Supabase native auth to verify the JWT
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return null;

        const auth_id = user.id;

        // Map the UUID back to the public.users integer ID so we don't break existing routes
        const { data: publicUser, error: dbError } = await supabase
            .from('users')
            .select('id, username, role, is_active')
            .eq('auth_id', auth_id)
            .single();

        if (dbError || !publicUser) return null;

        return {
            id: publicUser.id,           // Integer ID
            username: publicUser.username,
            role: publicUser.role,
            is_active: publicUser.is_active,
            auth_id: auth_id             // UUID
        };
    } catch (err) {
        return null;
    }
};

module.exports = { authenticateToken };