import type { Request, Response } from 'express';
import { prisma } from '../db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // 1. Authenticate with Supabase
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return res.status(401).json({ error: error.message });

        const userId = data.user.id;

        // 2. Fetch User Profile & Intern Status from Prisma
        const profile = await prisma.profiles.findUnique({
            where: { id: userId },
            include: { interns: true } // Assuming relation is named 'interns'
        });

        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // 3. Check Account Active Status (Custom logic)
        // You can reuse your logic: (profile.status !== 'deactivated')
        if (profile.interns?.status === 'deactivated') {
            await supabaseAdmin.auth.admin.signOut(data.session.access_token);
            return res.status(403).json({ error: 'Your internship account is no longer active.' });
        }

        // 4. Return Session & Profile
        res.json({
            message: 'Login successful',
            data: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: profile
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};