const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, feedbackController.addFeedback);
router.get('/:submissionId', auth, feedbackController.getFeedbackBySubmission);

module.exports = router;
