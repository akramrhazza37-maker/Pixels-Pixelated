// Check if user is authenticated via local storage
window.onload = function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('userEmail');

    if (!isLoggedIn) {
        // If not logged in, kick them back to login page
        window.location.href = 'LoginPage.html';
        return;
    }

    // Display the user's logged-in email dynamically
    if (userEmail) {
        const emailElement = document.getElementById('display-email');
        if (emailElement) {
            emailElement.innerText = userEmail;
        }
    }
};

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'LoginPage.html';
}