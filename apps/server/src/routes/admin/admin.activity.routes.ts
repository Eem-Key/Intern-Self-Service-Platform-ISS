import { Router } from 'express';
import { 
    authenticate,
    isAdmin
} from '../../middleware/auth.js';
import { 
    fetchReviewedApprovalRecords
} from '../../controllers/admin/admin.activity.controller.js';

const router = Router();

router.get('/reviewed-approvals', authenticate, isAdmin, fetchReviewedApprovalRecords);


export default router;