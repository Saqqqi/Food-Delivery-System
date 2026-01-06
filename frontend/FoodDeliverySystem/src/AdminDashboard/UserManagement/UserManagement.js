import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAddPasswordModal, setShowAddPasswordModal] = useState(false);
    const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('food123');
            const response = await fetch('http://localhost:3005/api/admin/users', {
                headers: {
                    'admin-key': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkPasswordStatus = (user) => {
        // Check if user has password (local auth) or uses Firebase
        if (user.authProvider === 'firebase-google' || user.authProvider === 'firebase-email') {
            return {
                hasPassword: false,
                authMethod: 'Firebase',
                status: 'OAuth',
                color: '#28a745'
            };
        } else if (user.password) {
            return {
                hasPassword: true,
                authMethod: 'Local',
                status: 'Hashed',
                color: '#007bff'
            };
        } else {
            return {
                hasPassword: false,
                authMethod: 'Unknown',
                status: 'No Password',
                color: '#dc3545'
            };
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleAddPassword = async (userId) => {
        if (!newPassword || newPassword.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        try {
            const token = localStorage.getItem('food123');
            const response = await fetch(`http://localhost:3005/api/admin/users/${userId}/add-password`, {
                method: 'POST',
                headers: {
                    'admin-key': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add password');
            }

            alert('Password added successfully');
            setShowAddPasswordModal(false);
            setNewPassword('');
            setSelectedUser(null);
            fetchUsers(); // Refresh the list
        } catch (err) {
            console.error('Add password error:', err);
            alert('Error: ' + err.message);
        }
    };

    const handleUpdatePassword = async (userId) => {
        if (!newPassword || newPassword.length < 6) {
            alert('New password must be at least 6 characters long');
            return;
        }

        try {
            const token = localStorage.getItem('food123');
            const response = await fetch(`http://localhost:3005/api/admin/users/${userId}/update-password`, {
                method: 'PUT',
                headers: {
                    'admin-key': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update password');
            }

            alert('Password updated successfully');
            setShowUpdatePasswordModal(false);
            setNewPassword('');
            setCurrentPassword('');
            setSelectedUser(null);
            fetchUsers(); // Refresh the list
        } catch (err) {
            console.error('Update password error:', err);
            alert('Error: ' + err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const token = localStorage.getItem('food123');
            const response = await fetch(`http://localhost:3005/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'admin-key': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            alert('User deleted successfully');
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('food123');
            const response = await fetch(`http://localhost:3005/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'admin-key': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                throw new Error('Failed to update role');
            }

            alert('Role updated successfully');
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="user-management">
            {/* Modern Header */}
            <div className="modern-header">
                <div className="header-content">
                    <h1 className="main-title">
                        <span className="icon">👥</span>
                        User Management
                    </h1>
                    <p className="subtitle">Manage all users, passwords, and roles</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card">
                        <span className="stat-number">{filteredUsers.length}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{filteredUsers.filter(u => u.verified).length}</span>
                        <span className="stat-label">Verified</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{filteredUsers.filter(u => u.password).length}</span>
                        <span className="stat-label">With Password</span>
                    </div>
                </div>
            </div>

            {/* Modern Search and Filters */}
            <div className="modern-filters">
                <div className="search-container">
                    <div className="search-icon">🔍</div>
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="modern-search-input"
                    />
                </div>
                <div className="filter-controls">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="modern-select"
                    >
                        <option value="all">👥 All Roles</option>
                        <option value="user">👤 Users</option>
                        <option value="delivery_boy">🚚 Delivery Boys</option>
                        <option value="admin">👑 Admins</option>
                    </select>
                    <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="modern-toggle-btn"
                    >
                        {showPassword ? '🙈 Hide Passwords' : '🙊 Show Passwords'}
                    </button>
                </div>
            </div>

            <div className="users-table">
                <div className="table-scroll-indicator">
                    ↔️ Scroll horizontally to see all columns
                </div>
                <table>
                    <thead>
                        <tr>
                            <th><span className="header-icon">👤</span> Name</th>
                            <th><span className="header-icon">📧</span> Email</th>
                            <th><span className="header-icon">🔑</span> Role</th>
                            <th><span className="header-icon">✅</span> Verified</th>
                            <th><span className="header-icon">🔐</span> {showPassword ? 'Password Hash' : 'Password Status'}</th>
                            {showPassword && <th><span className="header-icon">🔒</span> Hashed Password</th>}
                            <th><span className="header-icon">🛡️</span> Auth Method</th>
                            <th><span className="header-icon">⭐</span> Points</th>
                            <th><span className="header-icon">📅</span> Joined</th>
                            <th><span className="header-icon">⚙️</span> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => {
                            const passwordInfo = checkPasswordStatus(user);
                            return (
                            <tr key={user._id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar">👤</div>
                                        <div className="user-info">
                                            <div className="user-name">{user.name}</div>
                                            <div className="user-email">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className="modern-role-select"
                                    >
                                        <option value="user">👤 User</option>
                                        <option value="delivery_boy">🚚 Delivery Boy</option>
                                        <option value="admin">👑 Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <span className={`verified-badge ${user.verified ? 'verified' : 'unverified'}`}>
                                        {user.verified ? '✅ Verified' : '❌ Not Verified'}
                                    </span>
                                </td>
                                <td>
                                    <span 
                                        className="password-status-badge"
                                        style={{ 
                                            backgroundColor: passwordInfo.color + '20',
                                            color: passwordInfo.color,
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {passwordInfo.status}
                                    </span>
                                </td>
                                {showPassword && (
                                    <td>
                                        <div 
                                            className="hash-display"
                                            title={user.password || 'N/A'}
                                            onClick={() => {
                                                if (user.password) {
                                                    navigator.clipboard.writeText(user.password);
                                                    alert('📋 Password hash copied to clipboard!');
                                                }
                                            }}
                                        >
                                            <div className="hash-header">🔐 BCRYPT HASH</div>
                                            <div className="hash-value">
                                                {user.password ? user.password.substring(0, 25) + '...' : '❌ No Password'}
                                            </div>
                                            <div className="hash-hint">Click to copy full hash</div>
                                        </div>
                                    </td>
                                )}
                                <td>
                                    <span 
                                        className="auth-method-badge"
                                        style={{ 
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {passwordInfo.authMethod}
                                    </span>
                                </td>
                                <td>
                                    <div className="points-display">
                                        <span className="points-number">{user.loyaltyPoints || 0}</span>
                                        <span className="points-label">points</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="date-display">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        {passwordInfo.hasPassword ? (
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowUpdatePasswordModal(true);
                                                }}
                                                className="modern-btn update-btn"
                                                title="Update password"
                                            >
                                                🔑 Update
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowAddPasswordModal(true);
                                                }}
                                                className="modern-btn add-btn"
                                                title="Add password"
                                            >
                                                ➕ Add
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="modern-btn delete-btn"
                                            title="Delete user"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showAddPasswordModal && selectedUser && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add Password for {selectedUser.name}</h3>
                        <p>Email: {selectedUser.email}</p>
                        <p><strong>This user currently has no password.</strong></p>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="password-input"
                        />
                        <div className="modal-actions">
                            <button
                                onClick={() => handleAddPassword(selectedUser._id)}
                                className="confirm-btn"
                            >
                                Add Password
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddPasswordModal(false);
                                    setNewPassword('');
                                    setSelectedUser(null);
                                }}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUpdatePasswordModal && selectedUser && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Update Password for {selectedUser.name}</h3>
                        <p>Email: {selectedUser.email}</p>
                        <input
                            type="password"
                            placeholder="Current password (optional)"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="password-input"
                        />
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="password-input"
                        />
                        <div className="modal-actions">
                            <button
                                onClick={() => handleUpdatePassword(selectedUser._id)}
                                className="confirm-btn"
                            >
                                Update Password
                            </button>
                            <button
                                onClick={() => {
                                    setShowUpdatePasswordModal(false);
                                    setNewPassword('');
                                    setCurrentPassword('');
                                    setSelectedUser(null);
                                }}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
