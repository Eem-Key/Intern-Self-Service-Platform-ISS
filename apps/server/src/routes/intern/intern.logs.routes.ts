import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { 
    fetchRecordsPaginated,
    fetchRecordById,
    fetchProfileUpdateRequestWithProfile,
    fetchFullName,
    updateProfileUpdateRequest
} from '../../controllers/intern/intern.logs.controller.js';

const router = Router();

router.get('/fetch', authenticate, fetchRecordsPaginated);

router.get('/attendance/:record_id', authenticate, (req, res) => fetchRecordById(req, res, 'attendance_logs'));
router.get('/eod-report/:record_id', authenticate, (req, res) => fetchRecordById(req, res, 'eod_reports'));
router.get('/leave/:record_id', authenticate, (req, res) => fetchRecordById(req, res, 'leave_requests'));
router.get('/profile-update/:record_id', authenticate, (req, res) => fetchRecordById(req, res, 'profile_update_requests'));
router.get('/profile-update-full/:record_id', authenticate, fetchProfileUpdateRequestWithProfile);
router.get('/name/:user_id', authenticate, fetchFullName);

router.patch('/profile-update-request/:record_id', authenticate, updateProfileUpdateRequest);

export default router;