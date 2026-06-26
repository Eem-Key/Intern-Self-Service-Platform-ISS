import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { 
    fetchProfile,
    checkPendingProfileUpdate,
    insertProfileUpdateRequest,
    updatePassword
} from '../../controllers/intern/intern.profile.controller.js';

const router = Router();

router.get('/fetch', authenticate, fetchProfile);
router.get('/pending/:update_type', authenticate, checkPendingProfileUpdate);
router.post('/request', authenticate, insertProfileUpdateRequest);
router.patch('/password', authenticate, updatePassword);

export default router;