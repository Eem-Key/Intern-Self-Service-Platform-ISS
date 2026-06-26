import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db.js';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = data.user; 
    next();
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const profile = await prisma.profiles.findUnique({
            where: { id: user.id },
            select: { role: true }
        });

        if (profile?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error checking role' });
    }
};