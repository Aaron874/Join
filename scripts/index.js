import { loginUser, registerUser, loginGuest } from './auth/auth.service.js';
import { createUserProfile } from '../firebase/user.service.js';
import { logout } from '../firebase/auth.js';
import { getSignUpErrorElements, attachSignUpValidation, attachLogInValidation, signUpValidation, getLogInErrorElements, validationBeforLogIn } from '../scripts/validation.js';


const successDialog = document.getElementById("sign_up_success_dialog_id");
const signUpContainerHeader = document.getElementById("sign_up_btn_wrapper_header_id");
const signUpContainerFooter = document.getElementById("sign_up_btn_wrapper_footer_id");
const MAXIMUM_ERROR_DISPLAY_TIME = 3000;
export let signUpElements = null;
export let logInElements = null;

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
            signUpValidation();
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
        document.querySelector('main').classList.add('sign-up-active');
        changeLogOrSignForm('Sign up');
        return;
    }
    if (event.target.closest('#back_to_log_in_btn_id') || event.target.closest('.back_to_log_in_btn')) {
        document.getElementById('back_to_log_in_btn_id').classList.add('hidden');
        document.querySelector('main').classList.remove('sign-up-active');
        changeLogOrSignForm('Log in');
    }
});

/**
 * Initializes the login page.
 * Logs out any existing user session, starts the logo animation,
 * and sets up validation for the login form fields.
 * @returns {Promise<void>}
 */
async function initLoginPage() {
    await logout();
    animateLogo();
    logInElements = getLogInErrorElements();
    attachLogInValidation(logInElements);
}

/**
 * Animates the logo on page load by scaling it from the center and fading in the login section.
 * Creates and triggers the logo animation, then schedules the login section to appear just before the animation completes.
 * @returns {void}
 */
function animateLogo() {
    const logo = document.querySelector('header img');
    if (!logo) return;

    const animation = createLogoAnimation(logo);
    showLoginBeforeAnimationEnds(animation);
    animation.onfinish = () => logo.style.zIndex = '';
}

/**
 * Calculates the CSS transform string to animate the logo from center of viewport.
 * Computes the translation needed to move the logo to the viewport center, scaled 8x larger.
 * @param {HTMLImageElement} logo - The logo image element to transform.
 * @returns {string} CSS transform string for centering and scaling the logo (e.g., 'translate(100px, 50px) scale(8)').
 */
function getLogoStartTransform(logo) {
    const { left, top, width, height } = logo.getBoundingClientRect();
    const x = innerWidth / 2 - left - width / 2;
    const y = innerHeight / 2 - top - height / 2;
    const scale = innerHeight > innerWidth ? 4 : 8;
    return `translate(${x}px, ${y}px) scale(${scale})`;
}

/**
 * Creates and returns a Web Animations API animation that scales the logo from 8x to normal size.
 * Sets the logo's position to relative and z-index to 1000 to ensure it appears above other content.
 * @param {HTMLImageElement} logo - The logo image element to animate.
 * @returns {Animation} The Web Animations API animation object with 2 second duration and ease-in-out timing.
 */
function createLogoAnimation(logo) {
    const startTransform = getLogoStartTransform(logo);
    logo.style.cssText += 'position:relative; z-index:1000;';

    return logo.animate([
        { transform: startTransform },
        { transform: 'translate(0) scale(1)' }
    ], {
        duration: 2000,
        easing: 'ease-in-out',
        fill: 'forwards'
    });
}

/**
 * Shows the login form after a delay, just before the logo animation completes (125ms before the end).
 * This creates the effect of the login form appearing as the logo animation finishes.
 * @param {Animation} animation - The logo animation object with timing information.
 * @returns {void}
 */
function showLoginBeforeAnimationEnds(animation) {
    const loginSection = document.querySelector('.login_section');
    if (!loginSection) return;

    setTimeout(() => {
        loginSection.classList.add('visible');
    }, animation.effect.getTiming().duration - 125);
}


/**
 * Log in as a guest user and navigate to the summary page.
 * Shows an error message if the guest login fails.
 * @returns {Promise<void>}
 */
async function createGuestUser() {
    try {
        await loginGuest();
        resizeObserver?.disconnect()
        window.location.href = "summary.html";
    } catch (error) {
        showErrorGuestLogin();
    }
}

/**
 * Switches the container between the sign-up and log-in forms.
 * Clears the current form, toggles the sign-up header/footer visibility,
 * renders the selected form template, and sets up its validation.
 * @param {"Sign up" | "Log in"} LogOrSign - Which form to display.
 * @returns {void}
 */
function changeLogOrSignForm(LogOrSign) {
    let logSignContainer = document.getElementById("sign_log_in_id");
    logSignContainer.innerHTML = "";
    if (LogOrSign === "Sign up") {
        changeStylesLogOrSignForm(LogOrSign)
        logSignContainer.innerHTML += signUpTemplate();
        signUpElements = getSignUpErrorElements();   
        attachSignUpValidation(signUpElements);   
    } if (LogOrSign === "Log in") {
        changeStylesLogOrSignForm(LogOrSign)
        logSignContainer.innerHTML += signInTemplate();
        logInElements = getLogInErrorElements();
        attachLogInValidation(logInElements);
    }
}

function changeStylesLogOrSignForm(LogOrSign) {
    if (LogOrSign === "Sign up") {
        signUpContainerHeader.classList.add("hidden");
        signUpContainerFooter.classList.add("hidden");
        // document.querySelector('main').style.minHeight = '585px';
        renderSignup()
    } if (LogOrSign === "Log in") {
        signUpContainerHeader.classList.remove("hidden");
        signUpContainerFooter.classList.remove("hidden");
        // document.querySelector('main').style.minHeight = '385px';
        renderLogin()
    }
}

// Test
const container = document.querySelector('main');
const footer = document.querySelector('footer')
const content = document.querySelector('.login_section');

let resizeObserver;

function renderLogin() {
  // Observer stoppen, falls er lief
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // inline min-height entfernen, damit das CSS wieder greift
  container.style.minHeight = '';
  footer.style.height = '';

}

function renderSignup() {
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    footer.style.height = '58px';
  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      container.style.minHeight = `${entry.target.scrollHeight}px`;
    }
  });

  resizeObserver.observe(content);
}




// Ende Test



/**
 * Log in the current user using form values and navigate to summary on success.
 * @returns {Promise<void>}
 */
async function loginCurrentUser() {
    if (validationBeforLogIn()) {
        let formValues = dataFromForm();
        setFormDisabled(true);
    try {
        await loginUser(formValues.email, formValues.password);
        setFormDisabled(false);
        resizeObserver?.disconnect()
        window.location.href = "summary.html";
    } catch (error) {
        showErrorLogIn();
    }}
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
 * Register a new user and create their profile.
 * @param {{email: string, password: string, username: string}} values - Registration details.
 * @returns {Promise<void>}
 */
export async function registerNewUser(values) {
    setFormDisabled(true);
    try {
        await registerUser(values.email, values.password);
        await createUserProfile(values.username, values.email);
        successDialogOpen();
        setFormDisabled(false);
    } catch (error) {
        showErrorSignUp(error);
    }
}

/**
 * Maps a sign-up error to a user-friendly message.
 * @param {{ code?: string } | string} error - The error object (with a Firebase error code) or a plain error string.
 * @returns {string} A user-friendly error message corresponding to the error.
 */
function signUpErrorMessage(error) {
    switch (error?.code || error) {
        case 'auth/email-already-in-use':
            return 'This email address is already registered.';
        case 'auth/invalid-email':
            return 'Please enter a valid, complete email address.';
        case 'auth/weak-password':
            return 'Password is too weak. Please choose a stronger one.';
        case 'Check Inputs above':
            return 'Check Inputs above';
        default:
            return 'Sign up failed. Please try again.';
    }
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
 * Displays a generic "username or password incorrect" error on the login form,
 * then hides it and re-enables the form after a fixed delay.
 * @returns {void}
 */
function showErrorLogIn() {
    const errorLogIn = document.getElementById("error_log_in_password_or_both");
    errorLogIn.textContent = "Username or Password incorrect";
    errorLogIn.classList.remove("hidden_errors");
    setTimeout(() => {
        errorLogIn.classList.add("hidden_errors");
        setFormDisabled(false);
    }, MAXIMUM_ERROR_DISPLAY_TIME);
}

/**
 * Displays a sign-up error message on the form, mapped to a user-friendly text,
 * then hides it and re-enables the form after a fixed delay.
 * @param {{ code?: string } | string} error - The error object (with a Firebase error code) or a plain error string.
 * @returns {void}
 */
export function showErrorSignUp(error) {
    const errorSignUp = document.getElementById("sign_up_error_id");
    errorSignUp.textContent = signUpErrorMessage(error);
    errorSignUp.classList.remove("hidden_errors");
    setTimeout(() => {
        errorSignUp.classList.add("hidden_errors");
        setFormDisabled(false);
    }, MAXIMUM_ERROR_DISPLAY_TIME);
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
 * Displays a "guest login failed" error message on the login form,
 * then hides it and re-enables the form after a fixed delay.
 * @returns {void}
 */
  function showErrorGuestLogin() {
    const errorLogIn = document.getElementById("error_log_in_password_or_both");
    errorLogIn.textContent = "Guest login failed. Please try again.";
    errorLogIn.classList.remove("hidden_errors");
    setTimeout(() => {
        errorLogIn.classList.add("hidden_errors");
        setFormDisabled(false);
        errorLogIn.textContent = "Username or Password incorrect";
    }, MAXIMUM_ERROR_DISPLAY_TIME);
  }
