const db = require('../config/db');

exports.submitAssignment = async (req, res) => {
    const { assignment_id, content } = req.body;
    const student_id = req.user.id;
    const file_path = req.file ? req.file.path : null;

    if (!assignment_id) {
        return res.status(400).json({ message: 'Assignment ID is required' });
    }

    try {
        await db.query(
            'INSERT INTO submissions (assignment_id, student_id, content, file_path, status) VALUES (?, ?, ?, ?, ?)',
            [assignment_id, student_id, content || '', file_path, 'submitted']
        );
        res.status(201).json({ message: 'Submission successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSubmissionsByAssignment = async (req, res) => {
    const { assignmentId } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT s.*, u.username FROM submissions s JOIN users u ON s.student_id = u.id WHERE s.assignment_id = ?',
            [assignmentId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, grade } = req.body;

    if (req.user.role !== 'tutor') {
        return res.status(403).json({ message: 'Only tutors can update status' });
    }

    try {
        await db.query('UPDATE submissions SET status = ? WHERE id = ?', [status, id]);
        if (grade) {
            const [fb] = await db.query('SELECT * FROM feedback WHERE submission_id = ?', [id]);
            if (fb.length > 0) {
                await db.query('UPDATE feedback SET grade = ?, tutor_id = ? WHERE submission_id = ?', [grade, req.user.id, id]);
            } else {
                await db.query('INSERT INTO feedback (submission_id, tutor_id, grade) VALUES (?, ?, ?)', [id, req.user.id, grade]);
            }
        }
        res.json({ message: 'Status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
