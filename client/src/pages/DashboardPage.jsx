import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2'; // Placeholder for charts
import 'chart.js/auto';

const DashboardPage = () => {
    const { user, logout, token } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        fetchAssignments();
        if (user.role === 'tutor') {
            fetchStats();
        }
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/analytics', {
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

            {user.role === 'tutor' && (
                <div className="bg-white p-6 rounded shadow mb-6">
                    <h2 className="text-xl mb-4">Create Assignment</h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const title = e.target.title.value;
                        const description = e.target.description.value;
                        const due_date = e.target.due_date.value;
                        try {
                            await axios.post('http://localhost:5001/api/assignments',
                                { title, description, due_date },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            e.target.reset();
                            fetchAssignments();
                            if (user.role === 'tutor') fetchStats();
                        } catch (err) {
                            alert('Failed to create assignment');
                        }
                    }}>
                        <div className="grid grid-cols-1 gap-4">
                            <input name="title" placeholder="Title" className="border p-2 rounded" required />
                            <textarea name="description" placeholder="Description" className="border p-2 rounded" required />
                            <input name="due_date" type="date" className="border p-2 rounded" required />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded w-fit">Create</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Upload Modal */}
            {selectedAssignment && (
                <div className="modal-overlay" onClick={() => setSelectedAssignment(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl mb-4">Upload Submission</h2>
                        <h3 className="font-bold mb-2">{selectedAssignment.title}</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData();
                            formData.append('assignment_id', selectedAssignment.id);
                            formData.append('file', e.target.file.files[0]);

                            try {
                                await axios.post('http://localhost:5001/api/submissions',
                                    formData,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'multipart/form-data'
                                        }
                                    }
                                );
                                alert('File Uploaded!');
                                fetchAssignments();
                                setSelectedAssignment(null);
                            } catch (err) {
                                alert('Upload Failed');
                            }
                        }}>
                            <input type="file" name="file" className="text-sm mb-4 w-full border p-2" required />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setSelectedAssignment(null)} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                                <button className="bg-blue-500 text-white px-3 py-1 rounded">Submit</button>
                            </div>
                        </form>
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
                            <li key={a.id} className="border-b py-2">
                                <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                                    onClick={() => {
                                        if (user.role === 'student' && (!a.status || a.status === 'resubmit')) {
                                            setSelectedAssignment(a);
                                        }
                                    }}>
                                    <div>
                                        <h3 className="font-bold text-blue-600">{a.title}</h3>
                                        <p className="text-sm text-gray-600">Due: {new Date(a.due_date).toLocaleDateString()}</p>
                                        <p>{a.description}</p>
                                        {user.role === 'student' && (
                                            <p className={`text-sm font-bold mt-1 ${a.status === 'marked' ? 'text-green-600' : a.status === 'resubmit' ? 'text-red-600' : 'text-gray-500'}`}>
                                                Status: {a.status || 'Not Submitted'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        {user.role === 'tutor' && (
                                            <a
                                                href={`/submissions/${a.id}`}
                                                className="bg-green-500 text-white px-3 py-1 rounded h-fit inline-block z-10 relative"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View Submissions
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
