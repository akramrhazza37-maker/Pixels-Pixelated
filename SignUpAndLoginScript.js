// Wrap the entire file's logic inside a DOMContentLoaded listener
window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const firstname_input = document.getElementById('FirstName-input');
    const email_input = document.getElementById('Email-input');
    const password_input = document.getElementById('Password-input');
    const confirm_password_input = document.getElementById('Confirm-password-input');
    const error_message = document.getElementById('error-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop page reload instantly
            
            let errors = [];

            if (firstname_input) {
                errors = getSignupFormErrors(firstname_input.value, email_input.value, password_input.value, confirm_password_input.value);
            } else {
                errors = getLoginFormErrors(email_input.value, password_input.value);
            }

            if (errors.length > 0) {
                error_message.innerText = errors.join(". ");
                return; 
            }

            try {
                const targetUrl = firstname_input ? 'http://localhost:3000/signup' : 'http://localhost:3000/login';
                
                const accountPayload = {
                    username: firstname_input ? firstname_input.value : null,
                    email: email_input.value,
                    password: password_input.value
                };

                const response = await fetch(targetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(accountPayload)
                });

                const serverResponse = await response.json();

                if (response.ok) {
                    alert(serverResponse.message || "Success!");
                    form.reset();
                } else {
                    error_message.innerText = serverResponse.error || "An error occurred.";
                }

            } catch (networkError) {
                console.error("Transmission failed:", networkError);
                error_message.innerText = "Cannot connect to backend server. Is Server.js running?";
            }
        });
    }

    function getSignupFormErrors(firstname, email, password, confirmPassword) {
        let errors = [];
        if (!firstname) { errors.push('Firstname is required'); if(firstname_input) firstname_input.parentElement.classList.add('incorrect'); }
        if (!email) { errors.push('Email is required'); if(email_input) email_input.parentElement.classList.add('incorrect'); }
        if (!password) { errors.push('Password is required'); if(password_input) password_input.parentElement.classList.add('incorrect'); }
        else if (password.length < 8) { errors.push('Password must be 8 characters or longer'); if(password_input) password_input.parentElement.classList.add('incorrect'); }
        if (password !== confirmPassword) { errors.push('Passwords do not match'); if(password_input) password_input.parentElement.classList.add('incorrect'); if(confirm_password_input) confirm_password_input.parentElement.classList.add('incorrect'); }
        return errors;
    }

    function getLoginFormErrors(email, password) {
        let errors = [];
        if (!email) { errors.push('Email is required'); if(email_input) email_input.parentElement.classList.add('incorrect'); }
        if (!password) { errors.push('Password is required'); if(password_input) password_input.parentElement.classList.add('incorrect'); }
        return errors;
    }

    const allInputs = [firstname_input, email_input, password_input, confirm_password_input];
    allInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                if (input.parentElement && input.parentElement.classList.contains('incorrect')) {
                    input.parentElement.classList.remove('incorrect');
                    if(error_message) error_message.innerText = '';
                }
            });
        }
    });
});
