import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

import { 
    loginUser,
    logoutUser,
    setupFirstPassword
} from '../controllers/login.controller.js';

const router = Router();

router.post('/login', loginUser);
router.post('/logout', authenticate, logoutUser);
router.patch('/setup-password', authenticate, setupFirstPassword);

export default router;