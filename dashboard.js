window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');

    if (!isLoggedIn) {
        window.location.href = 'LoginPage.html';
        return;
    }

    const emailDisplay = document.getElementById('user-display-email');
    if (emailDisplay && userEmail) {
        emailDisplay.innerText = "Logged in as: " + userEmail;
    }
});

function closeDashboard() {
    const card = document.querySelector('.dashboard-card');
    if (card) {
        card.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'LoginPage.html';
}

function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    const editEmailInput = document.getElementById('edit-email');
    const userEmail = localStorage.getItem('userEmail') || '';
    
    editEmailInput.value = userEmail;
    modal.style.display = 'flex';
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'none';
}

function saveProfile() {
    const editEmailInput = document.getElementById('edit-email');
    const newEmail = editEmailInput.value.trim();

    if (newEmail) {
        localStorage.setItem('userEmail', newEmail);
        
        const emailDisplay = document.getElementById('user-display-email');
        if (emailDisplay) {
            emailDisplay.innerText = "Logged in as: " + newEmail;
        }

        closeProfileModal();
    } else {
        alert('Please enter a valid email address.');
    }
}