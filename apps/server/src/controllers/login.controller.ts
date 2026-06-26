import type { Request, Response } from 'express';
import { prisma } from '../db.js';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { createClient } from '@supabase/supabase-js';

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(req.body)

    try {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });
            console.log('here')

        if (error) return res.status(401).json({ error: error.message });
            console.log('here1')


        const userId = data.user.id;

        const profile = await prisma.profiles.findUnique({
            where: { id: userId },
            include: { interns: true } 
        });

        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        if (profile.interns?.status === 'deactivated') {
            await supabaseAdmin.auth.admin.signOut(data.session.access_token);
            return res.status(403).json({ error: 'Your internship account is no longer active.' });
        }

            console.log('here2')
            console.log(data.session.access_token)
            console.log(data.session.refresh_token)
            console.log(profile)
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

export const logoutUser = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ error: 'No active session found.' });
    }

    try {
        const { error } = await supabaseAdmin.auth.admin.signOut(token);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: 'An unexpected error occurred during logout.' });
    }
};

export const setupFirstPassword = async (req: Request, res: Response) => {
    const { new_password, confirm_new_password } = req.body;
    const user = (req as any).user;
    const token = req.headers.authorization?.split(' ')[1];

    if (new_password !== confirm_new_password) {
        return res.status(400).json({ error: "Passwords do not match." });
    }

    try {
        const supabaseUserClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
            auth: { persistSession: false }
        });
        supabaseUserClient.auth.setSession({ access_token: token!, refresh_token: '' });

        const { error: authError } = await supabaseUserClient.auth.updateUser({
            password: new_password
        });

        if (authError) return res.status(400).json({ error: authError.message });

        await prisma.profiles.update({
            where: { id: user.id },
            data: { requires_password_change: false }
        });

        res.json({ message: 'Password set successfully' });
    } catch (err) {
        console.error('Setup password error:', err);
        res.status(500).json({ error: 'Failed to set password.' });
    }
};