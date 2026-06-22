import { loginGuest }
    from "../firebase/auth.service.js";

document
    .getElementById("guest-login-btn")
    .addEventListener("click", handleGuestLogin);

async function handleGuestLogin() {
    try {
        await loginGuest();

        window.location.href =
            "./pages/summary.html";

    } catch (error) {
        console.error(error);
    }
}