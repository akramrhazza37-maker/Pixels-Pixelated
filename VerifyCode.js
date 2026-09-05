const params = new URLSearchParams(window.location.search);

const email =
    params.get("email") ||
    localStorage.getItem("pendingEmail");

const form = document.getElementById("verify-form");
const codeInput = document.getElementById("code-input");
const errorMessage = document.getElementById("error-message");
const verifyButton = document.getElementById("verify-button");
const timeoutText = document.getElementById("text");

let resendAmount = 0;
const maxResends = 3;

console.log("Verification email:", email);

function resendCode() {
    if (!email) {
        errorMessage.innerText = "No email address was provided.";
        return;
    }

    if (resendAmount >= maxResends) {
        verifyButton.disabled = true;
        timeoutText.textContent = "Too many attempts. Verification disabled.";
        return;
    }

    timeoutText.textContent =
        "Took too long when verifying. Resending code...";

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

        resendAmount++;

        if (resendAmount >= maxResends) {
            verifyButton.disabled = true;
            timeoutText.textContent =
                "Too many attempts. Verification disabled.";
            return;
        }

        // Wait 2 minutes before the next resend
        setTimeout(resendCode, 2 * 60 * 1000);
    })
    .catch(error => {
        console.error("Resend error:", error);

        // Try again in 2 minutes
        setTimeout(resendCode, 2 * 60 * 1000);
    });
}

// First resend after 2 minutes
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
            localStorage.removeItem("pendingEmail");
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