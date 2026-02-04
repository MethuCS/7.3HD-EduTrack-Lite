import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';

const SubmissionsPage = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await axios.get(`http://localhost:5001/api/submissions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSubmissions(res.data);
            } catch (err) {
                alert('Failed to fetch submissions');
            }
        };
        fetchSubmissions();
    }, [id, token]);

    const updateStatus = async (subId, status) => {
        try {
            await axios.put(`http://localhost:5001/api/submissions/${subId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Status updated');
            // Refresh list
            const res = await axios.get(`http://localhost:5001/api/submissions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubmissions(res.data);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Submissions for Assignment {id}</h1>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border">Student</th>
                        <th className="py-2 px-4 border">Date</th>
                        <th className="py-2 px-4 border">Status</th>
                        <th className="py-2 px-4 border">File</th>
                        <th className="py-2 px-4 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map(s => (
                        <tr key={s.id}>
                            <td className="py-2 px-4 border">{s.username}</td>
                            <td className="py-2 px-4 border">{new Date(s.submission_date).toLocaleDateString()}</td>
                            <td className="py-2 px-4 border">
                                <span className={`px-2 py-1 rounded text-white ${s.status === 'marked' ? 'bg-green-500' :
                                        s.status === 'resubmit' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}>
                                    {s.status}
                                </span>
                            </td>
                            <td className="py-2 px-4 border">
                                {s.file_path ? (
                                    <a
                                        href={`http://localhost:5001/${s.file_path}`}
                                        target="_blank"
                                        className="text-blue-600 underline"
                                    >
                                        Download
                                    </a>
                                ) : 'No File'}
                            </td>
                            <td className="py-2 px-4 border">
                                <button onClick={() => updateStatus(s.id, 'marked')} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Mark</button>
                                <button onClick={() => updateStatus(s.id, 'resubmit')} className="bg-red-500 text-white px-2 py-1 rounded">Resubmit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SubmissionsPage;
