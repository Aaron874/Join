import { loginUser, registerUser } from './auth/auth.service.js';
import { createUserProfile, getUserProfile } from '../firebase/user.service.js';
export const user = "";

document.addEventListener('submit', (event) => {
    if (!event.target.matches('#sign_log_in_id')) return;
    event.preventDefault();
    switch (event.submitter.dataset.action) {
        case 'logIn':
            console.log("User Log In");
            break;
        case 'signUp':
            console.log("User Sign up");
            let confirmPassword = document.getElementById("confirm_password")
                confirmPassword.setCustomValidity("");
            // readUserProfile();
            userData(confirmPassword);
            break;
    }
});

async function readUserProfile() {
    let userProfile = await getUserProfile();
    if (userProfile) {
        console.log("User Profile:", userProfile);
    } else {
        console.log("No user profile found.");
    }
}

async function mainLogIn()  {
    let user = await loginUser(email, password)
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
    console.log(values.username, values.email);
    
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

