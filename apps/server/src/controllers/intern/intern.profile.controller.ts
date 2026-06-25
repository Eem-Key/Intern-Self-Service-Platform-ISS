import type { Request, Response } from 'express';
import { prisma } from '../../db.js';
import { supabaseAdmin } from '../../config/supabaseAdmin.js';
import { createClient } from '@supabase/supabase-js';

export const fetchProfile = async (req: Request, res: Response) => {
    const authUser = (req as any).user;

    try {
        const profileData = await prisma.profiles.findUnique({
            where: { id: authUser.id },
            include: {
                interns: true
            }
        });

        if (!profileData) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const { interns, ...rest } = profileData;
        
        res.json({
            ...rest,
            intern_info: interns
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

export const checkPendingProfileUpdate = async (req: Request, res: Response) => {
    const authUser = (req as any).user;

    const rawUpdateType = req.params.update_type;
    const update_type = Array.isArray(rawUpdateType) ? rawUpdateType[0] : rawUpdateType;
    
    if (!update_type) {
        return res.status(400).json({ error: 'update_type is required' });
    }

    try {
        const pending = await prisma.profile_update_requests.findFirst({
            where: {
                update_type: update_type as any,
                records: {
                    intern_id: authUser.id,
                    log_category: 'profile_update',
                    status: 'pending'
                }
            }
        });

        res.json({ has_pending: !!pending });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to check pending requests' });
    }
};

export const insertProfileUpdateRequest = async (req: Request, res: Response) => {
    const { updateRequest } = req.body;
    const intern_id = (req as any).user.id;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const record = await tx.records.create({
                data: {
                    intern_id,
                    log_category: 'profile_update',
                    activity_description: updateRequest.update_type === 'avatar_update' 
                        ? 'Profile_Picture' 
                        : 'Profile_Information',
                    status: 'pending'
                }
            });

            const request = await tx.profile_update_requests.create({
                data: {
                    record_id: record.id,
                    update_type: updateRequest.update_type,
                    requested_data: updateRequest.requested_data,
                    reason: updateRequest.reason
                }
            });

            return request;
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit profile update request' });
    }
};

export const updatePassword = async (req: Request, res: Response) => {
    const { payload } = req.body; 
    const authUser = (req as any).user; 

    if (payload.new_password === payload.current_password) {
        return res.status(400).json({ error: "New password cannot be the same as the current password." });
    }
    if (payload.new_password !== payload.confirm_new_password) {
        return res.status(400).json({ error: "New password does not match." });
    }

    try {
        const authClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
        
        const profile = await prisma.profiles.findUnique({
            where: { id: authUser.id },
            select: { email: true }
        });

        if (!profile?.email) {
            return res.status(400).json({ error: "User profile not found." });
        }

        const { error: signInError } = await authClient.auth.signInWithPassword({
            email: profile.email,
            password: payload.current_password
        });

        if (signInError) {
            return res.status(401).json({ error: "Current password is incorrect." });
        }
        
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            authUser.id,
            { password: payload.new_password }
        );

        if (authError) throw authError;

        await prisma.profiles.update({
            where: { id: authUser.id },
            data: { requires_password_change: false }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
};