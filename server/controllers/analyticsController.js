const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const [assignmentCount] = await db.query('SELECT COUNT(*) as count FROM assignments');
        const [submissionCount] = await db.query('SELECT COUNT(*) as count FROM submissions');
        const [feedbackCount] = await db.query('SELECT COUNT(*) as count FROM feedback');

        // Average grade
        const [avgGrade] = await db.query('SELECT AVG(grade) as average FROM feedback');

        res.json({
            assignments: assignmentCount[0].count,
            submissions: submissionCount[0].count,
            feedback: feedbackCount[0].count,
            averageGrade: avgGrade[0].average || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
