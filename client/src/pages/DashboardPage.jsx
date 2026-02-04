import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2'; // Placeholder for charts
import 'chart.js/auto';

const DashboardPage = () => {
    const { user, logout, token } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchAssignments();
        if (user.role === 'tutor') {
            fetchStats();
        }
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Welcome, {user.username} ({user.role})</h1>
                <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </header>

            {user.role === 'tutor' && stats && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-100 p-4 rounded text-center">
                        <h3 className="font-bold">Assignments</h3>
                        <p className="text-2xl">{stats.assignments}</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded text-center">
                        <h3 className="font-bold">Submissions</h3>
                        <p className="text-2xl">{stats.submissions}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded text-center">
                        <h3 className="font-bold">Pending Review</h3>
                        <p className="text-2xl">{stats.submissions - stats.feedback}</p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded text-center">
                        <h3 className="font-bold">Avg Grade</h3>
                        <p className="text-2xl">{stats.averageGrade.toFixed(1)}</p>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl mb-4">Assignments</h2>
                {assignments.length === 0 ? (
                    <p>No assignments found.</p>
                ) : (
                    <ul>
                        {assignments.map(a => (
                            <li key={a.id} className="border-b py-2 flex justify-between">
                                <div>
                                    <h3 className="font-bold">{a.title}</h3>
                                    <p className="text-sm text-gray-600">Due: {new Date(a.due_date).toLocaleDateString()}</p>
                                    <p>{a.description}</p>
                                </div>
                                {user.role === 'student' && (
                                    <button className="bg-blue-500 text-white px-3 py-1 rounded h-fit">Upload Submission</button>
                                )}
                                {user.role === 'tutor' && (
                                    <button className="bg-green-500 text-white px-3 py-1 rounded h-fit">View Submissions</button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
