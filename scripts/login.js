import { login } from "./auth.js";

async function handleLogin() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    await login(email, password);

    window.location.href = "board.html";
}
import { guestLogin } from "./auth.js";

window.guestAccess = async () => {

    await guestLogin();

    window.location.href = "board.html";
};