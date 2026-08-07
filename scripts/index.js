import { loginUser, registerUser, loginGuest } from './auth/auth.service.js';
import { createUserProfile } from '../firebase/user.service.js';

const successDialog = document.getElementById("sign_up_success_dialog_id");
const signUpContainer = document.getElementById("sign_up_btn_wrapper");

document.addEventListener('DOMContentLoaded', animateLogo);

function animateLogo() {
    const logo = document.querySelector('header img');
    if (!logo) return;
    const { left, top, width, height } = logo.getBoundingClientRect();
    const x = innerWidth / 2 - left - width / 2;
    const y = innerHeight / 2 - top - height / 2;
    logo.style.cssText += 'position:relative; z-index:1000;';
    const animation = logo.animate([
        { transform: `translate(${x}px, ${y}px) scale(8)` },
        { transform: 'translate(0) scale(1)' }
    ], { duration: 2000, easing: 'ease-in-out', fill: 'forwards' });
    animation.onfinish = () => logo.style.zIndex = '';
}

document.addEventListener('submit', (event) => {
    if (!event.target.matches('#sign_log_in_id')) return;
    event.preventDefault();
    switch (event.submitter.dataset.action) {
        case 'logIn':
            loginCurrentUser();
            break;
        case 'signUp':
            let confirmPassword = document.getElementById("confirm_password")
                confirmPassword.setCustomValidity("");
            userData(confirmPassword);
            break;
    }
});

document.addEventListener('click', (event) => {
    if (event.target.matches('.guest_login_btn')) {
        event.preventDefault();
        createGuestUser();
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

async function createGuestUser() {
    try {
        await loginGuest();
        window.location.href = "summary.html";
    } catch (error) {
        showErrorGuestLogin();
    }
}

function changeLogOrSignForm(LogOrSign) {
    let logSignContainer = document.getElementById("sign_log_in_id");
    logSignContainer.innerHTML = "";
    if (LogOrSign === "Sign up") {
        signUpContainer.classList.add("hidden");
        logSignContainer.innerHTML += signUpTemplate();
    } if (LogOrSign === "Log in") {
        signUpContainer.classList.remove("hidden");
        logSignContainer.innerHTML += signInTemplate();
    }
}


async function loginCurrentUser() {
    let formValues = dataFromForm();
    setFormDisabled(true);
    try {
        await loginUser(formValues.email, formValues.password);
        setFormDisabled(false);
        window.location.href = "summary.html";
    } catch (error) {
        showErrorLogIn();
        console.error(error.code, error.message);
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
    if (values.password !== values.confirmPassword) {
        confirmPassword.setCustomValidity("Passwords do not match");
        confirmPassword.reportValidity();
        return;
      }
    form.reset();
    registerNewUser(values);
}

async function registerNewUser(values) {
    setFormDisabled(true);
    try {
        await registerUser(values.email, values.password);
        await createUserProfile(values.username, values.email);
        successDialogOpen();
        setFormDisabled(false);
    } catch (error) {
        showErrorSignUp();
    }
}

function resetValidation (confirmPassword ) {
    confirmPassword.addEventListener("input", () => {
        confirmPassword.setCustomValidity("");
        confirmPassword.checkValidity()
        });
}

function successDialogOpen() {
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
        changeLogOrSignForm("Log in");
    }, 800);
}

function showErrorLogIn() {
    const errorLogIn = document.getElementById("login_error_id");
    errorLogIn.classList.remove("hidden");
    setTimeout(() => {
        errorLogIn.classList.add("hidden");
        setFormDisabled(false);
    }, 3000);
}

function showErrorSignUp() {
    const errorSignUp = document.getElementById("sign_up_error_id");
    errorSignUp.classList.remove("hidden");
    setTimeout(() => {
        errorSignUp.classList.add("hidden");
        setFormDisabled(false);
    }, 3000);
}

function setFormDisabled(disabled) {
    document
      .querySelectorAll("#sign_log_in_id input, #sign_log_in_id button")
      .forEach(element => {
        element.disabled = disabled;
      });
  }

  function showErrorGuestLogin() {
    const errorLogIn = document.getElementById("login_error_id");
    errorLogIn.textContent = "Guest login failed. Please try again.";
    errorLogIn.classList.remove("hidden");
    setTimeout(() => {
        errorLogIn.classList.add("hidden");
        setFormDisabled(false);
        errorLogIn.textContent = "Username or Password incorrect";
    }, 3000);
  }
