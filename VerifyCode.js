const params = new URLSearchParams(window.location.search);
const email = params.get("email");

const form = document.getElementById("verify-form");
const codeInput = document.getElementById("code-input");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const code = codeInput.value.trim();

    if (!email) {
        errorMessage.innerText = "No email address was provided.";
        return;
    }

    if (code.length !== 4) {
        errorMessage.innerText = "Please enter the 4-digit code.";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/verify-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                code: code
            })
        });

        const data = await response.json();

        if (response.ok && data.verified) {
            alert("Your account has been verified!");
            window.location.href = "dashboard.html";
        } else {
            errorMessage.innerText =
                data.error || "Incorrect verification code.";
        }

    } catch (error) {
        console.error(error);
        errorMessage.innerText =
            "Could not connect to the server.";
    }
});