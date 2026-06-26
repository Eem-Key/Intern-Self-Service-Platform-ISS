import { Router } from 'express';
import { 
    authenticate,
    isAdmin
} from '../../middleware/auth.js';
import { 
    fetchActiveInternsCount,
    fetchActiveAttendanceCount,
    fetchPendingRequestsCount,
    fetchAttendanceByRange,
    fetchAdminNotifications,
    markAdminNotificationAsRead
} from '../../controllers/admin/admin.dashboard.controller.js';

const router = Router();

router.get('/active-interns', authenticate, isAdmin, fetchActiveInternsCount);
router.get('/active-attendance', authenticate, isAdmin, fetchActiveAttendanceCount);
router.get('/pending-requests', authenticate, isAdmin, fetchPendingRequestsCount);

router.get('/attendance', authenticate, isAdmin, fetchAttendanceByRange);

router.get('/notifications', authenticate, fetchAdminNotifications);
router.patch('/notifications/:id/read', authenticate, markAdminNotificationAsRead);

export default router;