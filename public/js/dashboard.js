document.addEventListener('DOMContentLoaded', () => {
    // Initialize user data
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let currentConnections = [];
    let currentConversations = [];
    let activeChat = null;

    // If no user data, redirect to login
    if (!currentUser) {
        window.location.href = '/login';
        return;
    }

    // DOM Elements
    const sidebarNavItems = document.querySelectorAll('.sidebar-nav li');
    const contentSections = document.querySelectorAll('.content-section');
    const profileImage = document.getElementById('profileImage');
    const profileImageInput = document.getElementById('profileImageInput');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const welcomeName = document.getElementById('welcomeName');
    const logoutBtn = document.getElementById('logoutBtn');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordForm = document.getElementById('changePasswordForm');

    // Initialize dashboard
    async function initializeDashboard() {
        try {
            // Update UI with stored user data
            updateUserUI(currentUser);
            
            // Fetch additional user data from server
            const response = await fetch('/api/user/current');
            if (!response.ok) throw new Error('Failed to fetch user data');
            
            const serverUserData = await response.json();
            if (serverUserData.user) {
                currentUser = serverUserData.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUserUI(currentUser);
            }
            
            // Load other dashboard data
            loadConnections();
            loadConversations();
            loadRecentActivity();
            updateStats();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            showError('Failed to load dashboard data');
        }
    }

    // Update UI with user data
    function updateUserUI(user) {
        userName.textContent = user.name;
        userRole.textContent = user.role;
        welcomeName.textContent = user.name;
        
        if (user.profilePhoto) {
            profileImage.src = user.profilePhoto;
        } else {
            profileImage.src = '../images/default-avatar.png';
        }
    }

    // Load user connections
    async function loadConnections() {
        try {
            const response = await fetch('/api/connections');
            if (!response.ok) throw new Error('Failed to fetch connections');
            
            currentConnections = await response.json();
            updateConnectionsUI(currentConnections);
        } catch (error) {
            console.error('Error loading connections:', error);
            showError('Failed to load connections');
        }
    }

    // Update connections UI
    function updateConnectionsUI(connections) {
        const connectionsList = document.getElementById('connectionsList');
        connectionsList.innerHTML = connections.map(connection => `
            <div class="connection-card">
                <img src="${connection.profilePhoto || '../images/default-avatar.png'}" alt="${connection.name}">
                <h3>${connection.name}</h3>
                <p>${connection.role}</p>
                <div class="connection-actions">
                    <button onclick="startChat('${connection._id}')">
                        <i class="fas fa-comment"></i>
                    </button>
                    <button onclick="startVideoCall('${connection._id}')">
                        <i class="fas fa-video"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Load conversations
    async function loadConversations() {
        try {
            const response = await fetch('/api/conversations');
            if (!response.ok) throw new Error('Failed to fetch conversations');
            
            currentConversations = await response.json();
            updateConversationsUI(currentConversations);
        } catch (error) {
            console.error('Error loading conversations:', error);
            showError('Failed to load conversations');
        }
    }

    // Update conversations UI
    function updateConversationsUI(conversations) {
        const conversationsList = document.getElementById('conversationsList');
        conversationsList.innerHTML = conversations.map(conversation => `
            <div class="conversation-item" onclick="openChat('${conversation._id}')">
                <img src="${conversation.partner.profilePhoto || '../images/default-avatar.png'}" alt="${conversation.partner.name}">
                <div class="conversation-info">
                    <h4>${conversation.partner.name}</h4>
                    <p>${conversation.lastMessage || 'No messages yet'}</p>
                </div>
                <span class="timestamp">${formatTimestamp(conversation.lastUpdated)}</span>
            </div>
        `).join('');
    }

    // Load recent activity
    async function loadRecentActivity() {
        try {
            const response = await fetch('/api/activity');
            if (!response.ok) throw new Error('Failed to fetch activity');
            
            const activities = await response.json();
            updateActivityUI(activities);
        } catch (error) {
            console.error('Error loading activity:', error);
            showError('Failed to load recent activity');
        }
    }

    // Update activity UI
    function updateActivityUI(activities) {
        const activityList = document.getElementById('recentActivityList');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
                <div class="activity-content">
                    <p>${activity.description}</p>
                    <span class="timestamp">${formatTimestamp(activity.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }

    // Update dashboard stats
    async function updateStats() {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            
            const stats = await response.json();
            document.getElementById('activeConnections').textContent = stats.connections;
            document.getElementById('unreadMessages').textContent = stats.unreadMessages;
            document.getElementById('upcomingSessions').textContent = stats.upcomingSessions;
            document.getElementById('progressPercentage').textContent = `${stats.progress}%`;
        } catch (error) {
            console.error('Error updating stats:', error);
            showError('Failed to update statistics');
        }
    }

    // Profile picture upload
    profileImageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await fetch('/api/user/profile-picture', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload profile picture');
            
            const result = await response.json();
            profileImage.src = result.profilePicture;
            showSuccess('Profile picture updated successfully');
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            showError('Failed to update profile picture');
        }
    });

    // Profile update form
    const profileUpdateForm = document.getElementById('profileUpdateForm');
    profileUpdateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(profileUpdateForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update profile');
            
            const updatedUser = await response.json();
            updateUserUI(updatedUser);
            showSuccess('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            showError('Failed to update profile');
        }
    });

    // Change password form
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/user/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) throw new Error('Failed to change password');
            
            showSuccess('Password changed successfully');
            changePasswordModal.style.display = 'none';
            changePasswordForm.reset();
        } catch (error) {
            console.error('Error changing password:', error);
            showError('Failed to change password');
        }
    });

    // Navigation
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            
            // Update active states
            sidebarNavItems.forEach(navItem => navItem.classList.remove('active'));
            item.classList.add('active');
            
            contentSections.forEach(content => {
                content.classList.remove('active');
                if (content.id === section) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Logout
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Failed to logout');
            
            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out:', error);
            showError('Failed to logout');
        }
    });

    // Helper functions
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    function getActivityIcon(type) {
        const icons = {
            message: 'fa-comment',
            connection: 'fa-user-plus',
            session: 'fa-calendar-check',
            profile: 'fa-user-edit'
        };
        return icons[type] || 'fa-info-circle';
    }

    function showError(message) {
        // Implement error notification UI
        console.error(message);
    }

    function showSuccess(message) {
        // Implement success notification UI
        console.log(message);
    }

    // Initialize WebSocket for real-time updates
    const socket = new WebSocket(`ws://${window.location.host}/ws`);
    
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    function handleWebSocketMessage(data) {
        switch (data.type) {
            case 'new_message':
                updateConversationsUI(currentConversations);
                if (activeChat === data.conversationId) {
                    appendMessage(data.message);
                }
                break;
            case 'connection_update':
                loadConnections();
                break;
            case 'activity_update':
                loadRecentActivity();
                break;
        }
    }

    // Check mentor profile completion
    async function checkMentorProfile() {
        try {
            const response = await fetch('/api/mentor/profile');
            if (!response.ok) {
                throw new Error('Failed to fetch mentor profile');
            }
            
            const data = await response.json();
            
            // If user is a mentor and profile is not complete, redirect to profile completion
            if (data.role === 'mentor' && !data.isProfileComplete) {
                window.location.href = '/mentor-profile-completion.html';
            }
        } catch (error) {
            console.error('Error checking mentor profile:', error);
        }
    }

    // Initialize dashboard
    initializeDashboard();
    checkMentorProfile();
}); 