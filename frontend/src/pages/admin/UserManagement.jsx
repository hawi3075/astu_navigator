import React, { useEffect, useState } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([]); // Initialize as empty array

    useEffect(() => {
        fetch('http://localhost:5000/api/admin/users') // Changed to 5000
            .then(res => res.json())
            .then(data => {
                // Ensure data is an array before setting state
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error("Data is not an array:", data);
                    setUsers([]);
                }
            })
            .catch(err => console.error("Fetch error:", err));
    }, []);

    const deleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' });
        setUsers(users.filter(u => u._id !== id));
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Manage Users</h2>
            <div className="space-y-3">
                {users.length > 0 ? users.map(user => (
                    <div key={user._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                        <div>
                            <p className="font-bold">{user.username || user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <button onClick={() => deleteUser(user._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">Delete</button>
                    </div>
                )) : <p className="text-center text-slate-400">No users found.</p>}
            </div>
        </div>
    );
};

export default UserManagement;