window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');

    // If not logged in, kick them back to the login page
    if (!isLoggedIn) {
        window.location.href = 'LoginPage.html';
        return;
    }

    // Display user email if element exists
    const emailDisplay = document.getElementById('user-display-email');
    if (emailDisplay && userEmail) {
        emailDisplay.innerText = "Logged in as: " + userEmail;
    }
});

// Logout function attached to the button
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'LoginPage.html';
}

// Open the Profile Edit Modal
function openProfileModal() {
    const modal = document.getElementById('profile-modal');
    const editEmailInput = document.getElementById('edit-email');
    const userEmail = localStorage.getItem('userEmail') || '';
    
    editEmailInput.value = userEmail;
    modal.style.display = 'flex';
}

// Close the Profile Edit Modal
function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'none';
}

// Save Profile Changes
function saveProfile() {
    const editEmailInput = document.getElementById('edit-email');
    const newEmail = editEmailInput.value.trim();

    if (newEmail) {
        localStorage.setItem('userEmail', newEmail);
        
        // Update display text
        const emailDisplay = document.getElementById('user-display-email');
        if (emailDisplay) {
            emailDisplay.innerText = "Logged in as: " + newEmail;
        }

        closeProfileModal();
    } else {
        alert('Please enter a valid email address.');
    }
}