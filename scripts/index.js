import { loginUser, registerUser, loginGuest } from './auth/auth.service.js';
import { createUserProfile } from '../firebase/user.service.js';
import { logout } from '../firebase/auth.js'

const successDialog = document.getElementById("sign_up_success_dialog_id");
const signUpContainerHeader = document.getElementById("sign_up_btn_wrapper_header_id");
const signUpContainerFooter = document.getElementById("sign_up_btn_wrapper_footer_id");

document.addEventListener('DOMContentLoaded', initLoginPage);


/**
 * Registers a global submit event listener for the login/sign-up form.
 * Prevents the default form submission and delegates to the appropriate
 * handler based on the submitter's `data-action` attribute: logs in the
 * current user for `'logIn'`, or resets the confirm password field's
 * custom validity and processes the entered user data for `'signUp'`.
 *
 * @returns {void}
 *
 * @example
 * // Registered once at module load; no manual invocation needed.
 */
document.addEventListener('submit', (event) => {
    if (!event.target.matches('#sign_log_in_id')) return;
    event.preventDefault();
    switch (event.submitter.dataset.action) {
        case 'logIn':
            loginCurrentUser();
            break;
        case 'signUp':
            let confirmPassword = document.getElementById('confirm_password');
            confirmPassword.setCustomValidity('');
            userData(confirmPassword);
            break;
    }
});

/**
 * Registers a global click event listener that handles the login/registration
 * form interactions. Creates a guest user when the guest login button is
 * clicked, switches to the sign-up form and reveals the "back to login" button
 * when the sign-up link is clicked, or switches back to the login form and
 * hides the "back to login" button when it is clicked.
 *
 * @returns {void}
 *
 * @example
 * // Registered once at module load; no manual invocation needed.
 */
document.addEventListener('click', (event) => {
    if (event.target.matches('.guest_login_btn')) {
        event.preventDefault();
        createGuestUser();
        return;
    }
    if (event.target.matches('#change_to_sign_up_btn')) {
        document.getElementById('back_to_log_in_btn_id').classList.remove('hidden');
        changeLogOrSignForm('Sign up');
        return;
    }
    if (event.target.closest('#back_to_log_in_btn_id') || event.target.closest('.back_to_log_in_btn')) {
        document.getElementById('back_to_log_in_btn_id').classList.add('hidden');
        changeLogOrSignForm('Log in');
    }
});

/**
 * Initialize the login page.
 * Logs out any existing user session and starts the logo animation.
 * @returns {Promise<void>}
 */
/**
 * Initialize the login page.
 * Logs out any existing user session and starts the logo animation.
 * @returns {Promise<void>}
 */
async function initLoginPage() {
    await logout();
    animateLogo();
}

/**
 * Animate the page logo into place from the center of the viewport.
 */
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

/**
 * Log in as a guest user and navigate to the summary page.
 * Shows an error message if the guest login fails.
 * @returns {Promise<void>}
 */
async function createGuestUser() {
    try {
        await loginGuest();
        window.location.href = "summary.html";
    } catch (error) {
        showErrorGuestLogin();
    }
}

/**
 * Toggle the log in / sign up form state.
 * @param {string} LogOrSign - The form mode, either "Sign up" or "Log in".
 */
function changeLogOrSignForm(LogOrSign) {
    let logSignContainer = document.getElementById("sign_log_in_id");
    logSignContainer.innerHTML = "";
    if (LogOrSign === "Sign up") {
        signUpContainerHeader.classList.add("hidden");
        signUpContainerFooter.classList.add("hidden");
        logSignContainer.innerHTML += signUpTemplate();
    } if (LogOrSign === "Log in") {
        signUpContainerHeader.classList.remove("hidden");
        signUpContainerFooter.classList.remove("hidden");
        logSignContainer.innerHTML += signInTemplate();
    }
}


/**
 * Log in the current user using form values and navigate to summary on success.
 * @returns {Promise<void>}
 */
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

/**
 * Read the login form values and reset the form.
 * @returns {Object<string, string>} The submitted form values.
 */
function dataFromForm() {
    const form = document.getElementById("sign_log_in_id");
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    form.reset();
    return values;
}


/**
 * Validate sign-up data and start the user registration process.
 * @param {HTMLInputElement} confirmPassword - The password confirmation input element.
 * @returns {Promise<void>}
 */
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

/**
 * Register a new user and create their profile.
 * @param {{email: string, password: string, username: string}} values - Registration details.
 * @returns {Promise<void>}
 */
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

/**
 * Reset validation state for the confirm password input when the user types.
 * @param {HTMLInputElement} confirmPassword - The password confirmation input element.
 */
function resetValidation (confirmPassword ) {
    confirmPassword.addEventListener("input", () => {
        confirmPassword.setCustomValidity("");
        confirmPassword.checkValidity()
        });
}

/**
 * Show the success dialog and return the user to the login form after a delay.
 */
function successDialogOpen() {
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
        changeLogOrSignForm("Log in");
    }, 800);
}

/**
 * Display the login error message and re-enable the form.
 */
function showErrorLogIn() {
    const errorLogIn = document.getElementById("login_error_id");
    errorLogIn.classList.remove("hidden");
    setTimeout(() => {
        errorLogIn.classList.add("hidden");
        setFormDisabled(false);
    }, 3000);
}

/**
 * Display the sign-up error message and re-enable the form.
 */
function showErrorSignUp() {
    const errorSignUp = document.getElementById("sign_up_error_id");
    errorSignUp.classList.remove("hidden");
    setTimeout(() => {
        errorSignUp.classList.add("hidden");
        setFormDisabled(false);
    }, 3000);
}

/**
 * Enable or disable all inputs and buttons in the login form.
 * @param {boolean} disabled - True to disable the form, false to enable.
 */
function setFormDisabled(disabled) {
    document
      .querySelectorAll("#sign_log_in_id input, #sign_log_in_id button")
      .forEach(element => {
        element.disabled = disabled;
      });
  }

/**
 * Show the guest login error message and restore the form state.
 */
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
