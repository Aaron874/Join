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

function signOrLogBtns(showForm) {
    const isSignUp = showForm === 'Sign up';
    document.getElementById('back_to_log_in_btn_id').classList.toggle('hidden', !isSignUp);
    document.querySelector('main').classList.toggle('sign-up-active', isSignUp);
    changeLogOrSignForm(showForm);
}

async function initLoginPage() {
    await logout();
    animateLogo();
    logInElements = getLogInErrorElements();
    attachLogInValidation(logInElements);
}

function animateLogo() {
    const logo = document.querySelector('header img');
    if (!logo) return;

    const animation = createLogoAnimation(logo);
    showLoginBeforeAnimationEnds(animation);
    animation.onfinish = () => (logo.style.zIndex = '');
}

function getLogoStartTransform(logo) {
    const { left, top, width, height } = logo.getBoundingClientRect();
    const x = innerWidth / 2 - left - width / 2;
    const y = innerHeight / 2 - top - height / 2;
    const scale = innerHeight > innerWidth ? 4 : 8;
    return `translate(${x}px, ${y}px) scale(${scale})`;
}

function createLogoAnimation(logo) {
    const startTransform = getLogoStartTransform(logo);
    logo.style.cssText += 'position:relative; z-index:1000;';

    return logo.animate([{ transform: startTransform }, { transform: 'translate(0) scale(1)' }], {
        duration: 2000,
        easing: 'ease-in-out',
        fill: 'forwards',
    });
}

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

async function createGuestUser() {
    try {
        await loginGuest();
        resizeObserver?.disconnect();
        window.location.href = 'summary.html';
    } catch (error) {
        showErrorGuestLogin();
    }
}

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

function observerLogIn() {
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
    container.style.minHeight = '';
    footer.style.height = '';
}

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

function dataFromForm() {
    const form = document.getElementById('sign_log_in_id');
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    form.reset();
    return values;
}

export function handleNewUserSignUp() {
    const form = document.getElementById('sign_log_in_id');
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    form.reset();
    registerNewUser(values);
}

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

function resetPasswordIcon() {
    resetSinglePasswordIcon('sign_up_password_input', 'password_lock_icon');
    resetSinglePasswordIcon('sign_up_confirm_password_input', 'confirm_password_lock_icon');
}

function resetSinglePasswordIcon(inputId, iconId) {
    let input = document.getElementById(inputId);
    let icon = document.getElementById(iconId);
    input.type = 'password';
    icon.src = 'assets/img/lock.webp';
    icon.classList.remove('clickable');
}

function successDialogOpen() {
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
        changeLogOrSignForm('Log in');
    }, MAXIMUM_TIME_DIALOGS);
}

function setFormDisabled(disabled) {
    document
        .querySelectorAll('#sign_log_in_id input, #sign_log_in_id button')
        .forEach((element) => {
            element.disabled = disabled;
        });
}
