const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, assignmentController.createAssignment);
router.get('/', auth, assignmentController.getAssignments);
router.get('/:id', auth, assignmentController.getAssignmentById);

module.exports = router;
