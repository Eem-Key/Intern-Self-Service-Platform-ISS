import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { 
    fetchAttendanceByDate,
    timeIn,
    timeOut,
    fetchProgramProgress,
    fetchEODReportByDate,
    insertEODReport,
    updateEODReport,
    fetchNotifications,
    insertNotification,
    markNotificationAsRead,
} from '../../controllers/intern/intern.dashboard.controller.js';

const router = Router();

router.get('/date/:date', authenticate, fetchAttendanceByDate); 
router.post('/time-in', authenticate, timeIn);
router.patch('/time-out/:attendance_id', authenticate, timeOut);

router.get('/progress/:intern_id', authenticate, fetchProgramProgress);

router.get('/eod-report/:date', authenticate, fetchEODReportByDate);
router.post('/eod-report', authenticate, insertEODReport);
router.patch('/eod-report/:report_id', authenticate, updateEODReport);

router.get('/notifications', authenticate, fetchNotifications);
router.post('/notifications', authenticate, insertNotification);
router.patch('/notifications/:id/read', authenticate, markNotificationAsRead);

export default router;