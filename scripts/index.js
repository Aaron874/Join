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

/**
 * Initializes the login page logic once the DOM has fully loaded.
 */
document.addEventListener('DOMContentLoaded', initLoginPage);

/**
 * Handles submit events on the login/sign-up form (#sign_log_in_id), preventing the default
 * form submission and dispatching to either the login or sign-up flow based on which submit
 * button (identified via its data-action attribute) triggered the submission.
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
 * Handles global click events for the login/sign-up page: triggers guest login when the guest
 * login button is clicked, switches the form into sign-up mode when the "change to sign up"
 * button is clicked, and switches the form back into login mode when either the back-to-login
 * button or a back-to-login link/icon (matched via closest) is clicked.
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
 * Toggles the login/sign-up page between its two modes: shows or hides the back-to-login
 * button, toggles the "sign-up-active" class on the main element for mode-specific styling,
 * and updates the form content/labels accordingly.
 *
 * @param {string} showForm - The form mode to switch to. Pass "Sign up" to switch into sign-up mode; any other value switches into login mode.
 * @returns {void}
 */
function signOrLogBtns(showForm) {
    const isSignUp = showForm === 'Sign up';
    document.getElementById('back_to_log_in_btn_id').classList.toggle('hidden', !isSignUp);
    document.querySelector('main').classList.toggle('sign-up-active', isSignUp);
    changeLogOrSignForm(showForm);
}

/**
 * Initializes the login page: signs out any existing session, plays the logo intro animation,
 * collects the DOM elements used for login error display, and attaches live validation
 * behavior to the login form.
 *
 * @returns {Promise<void>}
 */
async function initLoginPage() {
    await logout();
    animateLogo();
    logInElements = getLogInErrorElements();
    attachLogInValidation(logInElements);
}

/**
 * Plays the header logo's intro animation and reveals the login form shortly before the
 * animation finishes, restoring the logo's z-index once the animation completes.
 *
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
 * Calculates the CSS transform needed to position and scale the header logo so it appears
 * centered in the viewport, as the starting point for the intro animation. The scale factor
 * differs depending on whether the viewport is in portrait or landscape orientation.
 *
 * @param {HTMLElement} logo - The logo image element to calculate the transform for.
 * @returns {string} A CSS transform value (translate + scale) positioning the logo at viewport center.
 */
function getLogoStartTransform(logo) {
    const { left, top, width, height } = logo.getBoundingClientRect();
    const x = innerWidth / 2 - left - width / 2;
    const y = innerHeight / 2 - top - height / 2;
    const scale = innerHeight > innerWidth ? 4 : 8;
    return `translate(${x}px, ${y}px) scale(${scale})`;
}

/**
 * Creates and starts the logo intro animation, moving the logo from its calculated centered
 * starting position/scale to its natural position and scale, elevating it above other content
 * via z-index for the duration of the animation.
 *
 * @param {HTMLElement} logo - The logo image element to animate.
 * @returns {Animation} The running Web Animations API Animation object.
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
 * Reveals the login section, footer, and header sign-up button shortly before the logo
 * animation finishes, so the page content fades/appears in just ahead of the animation's end
 * rather than waiting for a jarring pop-in afterward.
 *
 * @param {Animation} animation - The running logo animation, used to time the reveal relative to its duration.
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
 * Logs in as a guest user and redirects to the summary page on success, disconnecting the
 * active resize observer beforehand to avoid it firing during navigation. Shows an error
 * message if the guest login fails.
 *
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
 * Swaps the content of the login/sign-up form container between the sign-up and login
 * templates, applies the corresponding styling, and (re)wires up the appropriate validation
 * for whichever form is now shown, tearing down the other form's validation listeners.
 *
 * @param {string} LogOrSign - The form to switch to. Pass "Sign up" to render the sign-up form; any other value renders the login form.
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
 * Shows or hides the sign-up-related header/footer sections depending on the target form, and
 * sets up the corresponding resize observer for that form's layout adjustments.
 *
 * @param {string} LogOrSign - The form being switched to, either "Sign up" or "Log in".
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
 * Tears down any active resize observer used for the sign-up form's layout and resets the
 * manually applied min-height/height styles on the container and footer, restoring the
 * default (login form) layout behavior.
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
 * Sets up a resize observer for the sign-up form that dynamically adjusts the container's
 * min-height to match the content's scroll height, so the layout grows correctly as sign-up
 * form fields (and their validation messages) appear or disappear. Also fixes the footer to a
 * reduced height while the sign-up form is active. Any previously active resize observer is
 * disconnected first.
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
 * Validates and submits the login form: if validation passes, disables the form, attempts to
 * log in with the entered email and password, and on success resets the password field icon,
 * disconnects the active resize observer, and redirects to the summary page. Re-enables the
 * form and shows an error message if login fails.
 *
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
 * Reads all field values from the login/sign-up form into a plain object and resets the form
 * afterward.
 *
 * @returns {Object<string, string>} An object mapping form field names to their entered values.
 */
function dataFromForm() {
    const form = document.getElementById('sign_log_in_id');
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    form.reset();
    return values;
}

/**
 * Reads all field values from the sign-up form, resets the form, and passes the collected
 * data on to registerNewUser to create the new account.
 *
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
 * Registers a new user account and creates the corresponding user profile, then shows a
 * success dialog and resets the password field icons on success. Re-enables the form and
 * shows an error dialog if registration fails.
 *
 * @param {Object} values - The sign-up form data.
 * @param {string} values.username - The desired username for the new user's profile.
 * @param {string} values.email - The new user's email address.
 * @param {string} values.password - The new user's chosen password.
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
 * Resets the password visibility icons for both the sign-up password field and the confirm
 * password field back to their default (locked/hidden) state.
 *
 * @returns {void}
 */
function resetPasswordIcon() {
    resetSinglePasswordIcon('sign_up_password_input', 'password_lock_icon');
    resetSinglePasswordIcon('sign_up_confirm_password_input', 'confirm_password_lock_icon');
}

/**
 * Resets a single password input field back to its masked (type="password") state and
 * restores its associated visibility toggle icon to the default lock icon, removing the
 * clickable styling.
 *
 * @param {string} inputId - The ID of the password input element to reset.
 * @param {string} iconId - The ID of the associated visibility toggle icon element to reset.
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
 * Opens the sign-up success dialog and automatically closes it after MAXIMUM_TIME_DIALOGS
 * milliseconds, switching the form back to the login view afterward.
 *
 * @returns {void}
 */
function successDialogOpen() {
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
        changeLogOrSignForm('Log in');
    }, MAXIMUM_TIME_DIALOGS);
}

/**
 * Enables or disables all input and button elements within the login/sign-up form, typically
 * used to prevent duplicate submissions while an async request is in progress.
 *
 * @param {boolean} disabled - Whether to disable (true) or enable (false) the form elements.
 * @returns {void}
 */
function setFormDisabled(disabled) {
    document
        .querySelectorAll('#sign_log_in_id input, #sign_log_in_id button')
        .forEach((element) => {
            element.disabled = disabled;
        });
}
