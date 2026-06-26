import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { 
    fetchLeaveDates,
    insertLeaveRequest,
    checkOverlap
} from '../../controllers/intern/intern.leave.controller.js';

const router = Router();

router.get('/dates', authenticate, fetchLeaveDates);
router.post('/request', authenticate, insertLeaveRequest);
router.get('/check-overlap', authenticate, checkOverlap);

export default router;