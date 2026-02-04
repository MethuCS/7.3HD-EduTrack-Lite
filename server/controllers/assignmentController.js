const db = require('../config/db');

exports.createAssignment = async (req, res) => {
    const { title, description, due_date } = req.body;
    const created_by = req.user.id; // From middleware

    if (!title || !due_date) {
        return res.status(400).json({ message: 'Title and due date are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO assignments (title, description, due_date, created_by) VALUES (?, ?, ?, ?)',
            [title, description, due_date, created_by]
        );
        res.status(201).json({ message: 'Assignment created', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAssignments = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`Fetching assignments for user: ${userId}`);
        const [rows] = await db.query(`
            SELECT a.*, s.status, s.file_path 
            FROM assignments a 
            LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ?
            ORDER BY a.created_at DESC
        `, [userId]);
        console.log('Assignments found:', rows);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAssignmentById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM assignments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Assignment not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
