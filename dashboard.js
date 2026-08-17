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