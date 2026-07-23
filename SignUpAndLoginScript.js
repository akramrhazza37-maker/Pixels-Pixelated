window.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form');

    const firstname_input = document.getElementById('FirstName-input');
    const email_input = document.getElementById('Email-input');
    const password_input = document.getElementById('Password-input');
    const confirm_password_input = document.getElementById('Confirm-password-input');
    const error_message = document.getElementById('error-message');


    if (form) {

        form.addEventListener('submit', async (e) => {

            e.preventDefault();

            let errors = [];

            const isSignup = firstname_input !== null;


            if (isSignup) {

                errors = getSignupFormErrors(
                    firstname_input.value,
                    email_input.value,
                    password_input.value,
                    confirm_password_input.value
                );

            } else {

                errors = getLoginFormErrors(
                    email_input.value,
                    password_input.value
                );

            }


            if (errors.length > 0) {

                error_message.innerText = errors.join(". ");
                return;

            }


            try {

                // Your Node.js server
                const API_URL = "http://localhost:3000";


                const endpoint = isSignup
                    ? "/signup"
                    : "/login";


                const data = {

                    username: isSignup
                        ? firstname_input.value
                        : undefined,

                    email: email_input.value,

                    password: password_input.value

                };


                const response = await fetch(API_URL + endpoint, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(data)

                });



                const result = await response.json();



                if (response.ok) {

                    alert(result.message || "Success!");

                    form.reset();

                } else {

                    error_message.innerText =
                        result.error || "Something went wrong.";

                }



            } catch (error) {

                console.error(error);

                error_message.innerText =
                    "Cannot connect to server. Make sure server.js is running.";

            }


        });

    }




    function getSignupFormErrors(firstname, email, password, confirmPassword) {

        let errors = [];


        if (!firstname) {
            errors.push("Firstname is required");
        }


        if (!email) {
            errors.push("Email is required");
        }


        if (!password) {

            errors.push("Password is required");

        } else if (password.length < 8) {

            errors.push("Password must be at least 8 characters");

        }


        if (password !== confirmPassword) {

            errors.push("Passwords do not match");

        }


        return errors;

    }





    function getLoginFormErrors(email, password) {

        let errors = [];


        if (!email) {

            errors.push("Email is required");

        }


        if (!password) {

            errors.push("Password is required");

        }


        return errors;

    }




});