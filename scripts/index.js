import { loginUser, registerUser, loginGuest } from './auth/auth.service.js';
import { createUserProfile } from '../firebase/user.service.js';
import { logout } from '../firebase/auth.js';
import {
    attachSignUpValidation,
    attachLogInValidation,
    signUpValidation,
    validationBeforLogIn,
    setupSignUpValidationListener,
    stopSignUpValidationListener,
} from '../scripts/validation.js';
import {
    errorDialogOpenClose,
    showErrorGuestLogin,
    showErrorLogIn,
    getSignUpErrorElements,
    getLogInErrorElements,
} from './SignUpOrLogInErrors.js';

const successDialog = document.getElementById('sign_up_success_dialog_id');
const signUpContainerHeader = document.getElementById('sign_up_btn_wrapper_header_id');
const signUpContainerFooter = document.getElementById('sign_up_btn_wrapper_footer_id');
const container = document.querySelector('main');
const footer = document.querySelector('footer');
const content = document.querySelector('.login_section');
let resizeObserver;
export const MAXIMUM_TIME_DIALOGS = 800;
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
 * Delegated click handler for guest login, switching to the sign-up
 * form, and switching back to the log-in form.
 * @param {MouseEvent} event - The click event.
 * @returns {void}
 */
document.addEventListener('click', (event) => {
    if (event.target.matches('.guest_login_btn')) {
        event.preventDefault();
        createGuestUser();
        return;
    }
    if (event.target.matches('#change_to_sign_up_btn')) {
        signOrLogBtns('Sign up');
        return;
    }
    if (
        event.target.closest('#back_to_log_in_btn_id') ||
        event.target.closest('.back_to_log_in_btn')
    ) {
        signOrLogBtns('Log in');
    }
});

/**
 * Toggles the visibility of the "back to login" button and the
 * sign-up-active state on the main container, then renders the
 * selected form.
 * @param {"Sign up" | "Log in"} showForm - Which form to display.
 * @returns {void}
 */
function signOrLogBtns(showForm) {
    const isSignUp = showForm === 'Sign up';
    document.getElementById('back_to_log_in_btn_id').classList.toggle('hidden', !isSignUp);
    document.querySelector('main').classList.toggle('sign-up-active', isSignUp);
    changeLogOrSignForm(showForm);
}

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
    animation.onfinish = () => (logo.style.zIndex = '');
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

    return logo.animate([{ transform: startTransform }, { transform: 'translate(0) scale(1)' }], {
        duration: 2000,
        easing: 'ease-in-out',
        fill: 'forwards',
    });
}

/**
 * Shows the login form after a delay, just before the logo animation completes (125ms before the end).
 * This creates the effect of the header, login and footer form appearing as the logo animation finishes.
 * @param {Animation} animation - The logo animation object with timing information.
 * @returns {void}
 */
function showLoginBeforeAnimationEnds(animation) {
    const loginSection = document.querySelector('.login_section');
    const footer = document.querySelector('footer');
    const header = document.querySelector('.sign_up_btn_wrapper_header');
    if (!loginSection) return;

    setTimeout(() => {
        loginSection?.classList.add('visible');
        footer?.classList.add('visible');
        header?.classList.add('visible');
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
        resizeObserver?.disconnect();
        window.location.href = 'summary.html';
    } catch (error) {
        showErrorGuestLogin();
    }
}

/**
 * Switches the container between the sign-up and log-in forms.
 * Clears the current form, toggles the container styles, renders the
 * selected form template, and sets up its validation and listeners.
 * @param {"Sign up" | "Log in"} LogOrSign - Which form to display.
 * @returns {void}
 */
function changeLogOrSignForm(LogOrSign) {
    const isSignUp = LogOrSign === 'Sign up';
    let logSignContainer = document.getElementById('sign_log_in_id');
    logSignContainer.innerHTML = '';
    changeStylesLogOrSignForm(LogOrSign);
    logSignContainer.innerHTML = isSignUp ? signUpTemplate() : signInTemplate();
    if (isSignUp) {
        signUpElements = getSignUpErrorElements();
        attachSignUpValidation(signUpElements);
        setupSignUpValidationListener();
    } else {
        logInElements = getLogInErrorElements();
        attachLogInValidation(logInElements);
        stopSignUpValidationListener();
    }
}

/**
 * Toggles between the sign-up and login view by showing/hiding the shared header and footer and rendering the matching form.
 *
 * @param {"Sign up"|"Log in"} LogOrSign - Which view to switch to.
 * @returns {void}
 */
function changeStylesLogOrSignForm(LogOrSign) {
    if (LogOrSign === 'Sign up') {
        signUpContainerHeader.classList.add('hidden');
        signUpContainerFooter.classList.add('hidden');
        observerSignUp();
    }
    if (LogOrSign === 'Log in') {
        signUpContainerHeader.classList.remove('hidden');
        signUpContainerFooter.classList.remove('hidden');
        observerLogIn();
    }
}

/**
 * Resets the sign-up resize observer and clears the inline min-height/height overrides on the container and footer so the CSS-defined login layout applies again.
 *
 * @returns {void}
 */
function observerLogIn() {
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
    container.style.minHeight = '';
    footer.style.height = '';
}

/**
 * Sets up the sign-up layout by fixing the footer height and (re)starting a ResizeObserver that keeps the container's min-height in sync with the content's scroll height.
 *
 * @returns {void}
 */
function observerSignUp() {
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
    footer.style.height = '50px';
    resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            container.style.minHeight = `${entry.target.scrollHeight}px`;
        }
    });

    resizeObserver.observe(content);
}

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
            resetSinglePasswordIcon('login_password_id', 'log_in_password_lock_icon');
            resizeObserver?.disconnect();
            window.location.href = 'summary.html';
        } catch (error) {
            showErrorLogIn();
        }
    }
}

/**
 * Read the login form values and reset the form.
 * @returns {Object<string, string>} The submitted form values.
 */
function dataFromForm() {
    const form = document.getElementById('sign_log_in_id');
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    form.reset();
    return values;
}

/**
 * Reads the sign-up form's input values, resets the form,
 * and registers a new user with the collected data.
 * @returns {void}
 */
export function handleNewUserSignUp() {
    const form = document.getElementById('sign_log_in_id');
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    form.reset();
    registerNewUser(values);
}

/**
 * Registers a new user with the given form values, creates their profile,
 * and shows a success dialog, or displays an error dialog on failure.
 * @param {{ username: string, email: string, password: string }} values - The sign-up form values.
 * @returns {Promise<void>}
 */
export async function registerNewUser(values) {
    setFormDisabled(true);
    try {
        await registerUser(values.email, values.password);
        await createUserProfile(values.username, values.email);
        successDialogOpen();
        setFormDisabled(false);
        resetPasswordIcon();
    } catch (error) {
        errorDialogOpenClose(error);
    }
}

/**
 * Resets the password and confirm password fields and their icons
 * to their default (masked, lock icon) state.
 * @returns {void}
 */
function resetPasswordIcon() {
    resetSinglePasswordIcon('sign_up_password_input', 'password_lock_icon');
    resetSinglePasswordIcon('sign_up_confirm_password_input', 'confirm_password_lock_icon');
}

/**
 * Resets a single password field and its icon to the default
 * (masked, lock icon) state.
 * @param {string} inputId - The ID of the password input element.
 * @param {string} iconId - The ID of the icon element.
 * @returns {void}
 */
function resetSinglePasswordIcon(inputId, iconId) {
    let input = document.getElementById(inputId);
    let icon = document.getElementById(iconId);
    input.type = 'password';
    icon.src = 'assets/img/lock.webp';
    icon.classList.remove('clickable');
}

/**
 * Show the success dialog and return the user to the login form after a delay.
 */
function successDialogOpen() {
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
        changeLogOrSignForm('Log in');
    }, MAXIMUM_TIME_DIALOGS);
}

/**
 * Enable or disable all inputs and buttons in the login form.
 * @param {boolean} disabled - True to disable the form, false to enable.
 */
function setFormDisabled(disabled) {
    document
        .querySelectorAll('#sign_log_in_id input, #sign_log_in_id button')
        .forEach((element) => {
            element.disabled = disabled;
        });
}
