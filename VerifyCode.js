const params = new URLSearchParams(window.location.search);
const email = params.get("email");

const form = document.getElementById("verify-form");
const codeInput = document.getElementById("code-input");
const errorMessage = document.getElementById("error-message");
const verifyButton = document.getElementById("verify-button");
const timeoutText = document.getElementById("text");

let resendAmount = 0;

function resendCode() {
    timeoutText.textContent = "Took to long when verifying. Resent code"
    fetch("http://localhost:3000/resend-code", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Code resent:", data);

        // Wait another 2 minutes, then resend again
        setTimeout(resendCode, 2 * 60 * 1000);
    })
    .catch(error => {
        console.error("Resend error:", error);

        // Try again in 2 minutes even if there was an error
        setTimeout(resendCode, 2 * 60 * 1000);
    });
    if (resendAmount > 3){
        verifyButton.disabled = true;
        timeoutText.textContent = "too many attemps. Disabled verification";
    }
    resendAmount++;
}

// Start the first 2-minute timer
setTimeout(resendCode, 2 * 60 * 1000);

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