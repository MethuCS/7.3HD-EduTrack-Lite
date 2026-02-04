const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const auth = require('../middleware/authMiddleware');
const upload = require('../config/upload');

router.post('/', auth, upload.single('file'), submissionController.submitAssignment);
router.get('/:assignmentId', auth, submissionController.getSubmissionsByAssignment);
router.put('/:id/status', auth, submissionController.updateStatus);

module.exports = router;
