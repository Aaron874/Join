import { loginUser, registerUser } from './auth/auth.service.js';
import { createUserProfile, getUserProfile } from '../firebase/user.service.js';
readUserProfile();

document.addEventListener('submit', (event) => {
    if (!event.target.matches('#sign_log_in_id')) return;
    event.preventDefault();
    switch (event.submitter.dataset.action) {
        case 'logIn':
            console.log("User Log In");
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

async function loginCurrentUser() {
    let formValues = dataFromForm();
    try {
        const uid = await loginUser(formValues.email, formValues.password);
        console.log("UID:", uid);
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

