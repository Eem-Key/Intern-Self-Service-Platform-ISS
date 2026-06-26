import { Router } from 'express';
import { 
    authenticate,
    isAdmin
} from '../../middleware/auth.js';
import { 
    fetchPendingRequestsPerCategory,
    fetchPendingApprovalRecords,
    updateAdminReviewRecord
} from '../../controllers/admin/admin.approvals.controller.js';

const router = Router();

router.get('/pending-by-category', authenticate, isAdmin, fetchPendingRequestsPerCategory);
router.get('/pending-approvals', authenticate, isAdmin, fetchPendingApprovalRecords);

router.patch('/records/:record_id/review', authenticate, isAdmin, updateAdminReviewRecord);

export default router;