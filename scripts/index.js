import { loginUser, registerUser } from './auth/auth.service.js';
import { createUserProfile, getUserProfile } from '../firebase/user.service.js';
// readUserProfile();

document.addEventListener('submit', (event) => {
    if (!event.target.matches('#sign_log_in_id')) return;
    event.preventDefault();
    switch (event.submitter.dataset.action) {
        case 'logIn':
            loginCurrentUser();
            break;
        case 'signUp':
            console.log("User Sign up");
            let confirmPassword = document.getElementById("confirm_password")
                confirmPassword.setCustomValidity("");
            userData(confirmPassword);
            break;
    }
});

document.addEventListener('click', (event) => {
    if (event.target.matches('.guest_login_btn')) {
        event.preventDefault();
        loginGuestUser();
        return
    }
    if (event.target.matches('#change_to_sign_up_btn')) {
        document.getElementById("back_to_log_in_btn_id").classList.remove("hidden");
        changeLogOrSignForm("Sign up");
        return;  
    }
    if (event.target.closest('#back_to_log_in_btn_id' || event.target.closest('.back_to_log_in_btn'))) {
        document.getElementById("back_to_log_in_btn_id").classList.add("hidden");
        changeLogOrSignForm("Log in");
}});

function changeLogOrSignForm(LogOrSign) {
    // changeHeaderSignOrLog(LogOrSign);
    let logSignContainer = document.getElementById("sign_log_in_id");
    logSignContainer.innerHTML = "";
    if (LogOrSign === "Sign up") {
        logSignContainer.innerHTML += signUpTemplate();
    } if (LogOrSign === "Log in") {
        logSignContainer.innerHTML += signInTemplate();
    }
}


async function loginCurrentUser() {
    let formValues = dataFromForm();
    try {
        const uid = await loginUser(formValues.email, formValues.password);
        window.location.href = "summary.html";
    } catch (error) {
        console.error(error.code, error.message);
        if (error.code === "auth/invalid-credential") {
            alert("E-Mail oder Passwort ist falsch.");
        }
    }
}

async function readUserProfile() {
    let userProfile = await getUserProfile();
    if (userProfile) {
        console.log("User Profile:", userProfile);
        console.log("uid:", userProfile.uid);
    } else {
        console.log("No user profile found.");
    }
}

function dataFromForm() {
    const form = document.getElementById("sign_log_in_id");
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    form.reset();
    return values;
}


async function userData (confirmPassword) {
    resetValidation(confirmPassword);
    const form = document.getElementById("sign_log_in_id");
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries())
    console.log(values.password, values.confirmPassword);
    if (values.password !== values.confirmPassword) {
        confirmPassword.setCustomValidity("Passwords do not match");
        confirmPassword.reportValidity();
        return;
      }
    form.reset();
    await registerUser(values.email, values.password);
    await createUserProfile(values.username, values.email);
}

function resetValidation (confirmPassword ) {
    confirmPassword.addEventListener("input", () => {
        confirmPassword.setCustomValidity("");
        confirmPassword.checkValidity()
        });
}
console.log(user);

