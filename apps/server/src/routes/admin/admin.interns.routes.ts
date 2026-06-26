import { Router } from 'express';
import { 
    authenticate,
    isAdmin
} from '../../middleware/auth.js';
import { 
    fetchAllInternList,
    fetchProfileById,
    fetchProgramProgressHours,
    fetchAllAttendanceById,
    fetchAllEodReportById,
    deactivateIntern
} from '../../controllers/admin/admin.interns.controller.js';

const router = Router();

router.get('/fetchall', authenticate, isAdmin, fetchAllInternList);

router.get('/profile/:user_id', authenticate, isAdmin, fetchProfileById);
router.get('/progress/:user_id', authenticate, fetchProgramProgressHours);
router.get('/attendance/:user_id', authenticate, isAdmin, fetchAllAttendanceById);
router.get('/eod-reports/:user_id', authenticate, isAdmin, fetchAllEodReportById);

router.patch('/deactivate/:intern_id', authenticate, isAdmin, deactivateIntern);

export default router;