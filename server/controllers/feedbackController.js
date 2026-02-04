const db = require('../config/db');

exports.addFeedback = async (req, res) => {
    const { submission_id, grade, comments } = req.body;
    const tutor_id = req.user.id; // From middleware

    // Check if user is tutor
    if (req.user.role !== 'tutor') {
        return res.status(403).json({ message: 'Only tutors can provide feedback' });
    }

    try {
        await db.query(
            'INSERT INTO feedback (submission_id, tutor_id, grade, comments) VALUES (?, ?, ?, ?)',
            [submission_id, tutor_id, grade, comments]
        );
        res.status(201).json({ message: 'Feedback added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFeedbackBySubmission = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM feedback WHERE submission_id = ?', [req.params.submissionId]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
