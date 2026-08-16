

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 30;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/; 
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Old Version

/**
 * Validate sign-up data and start the user registration process.
 * @param {HTMLInputElement} confirmPassword - The password confirmation input element.
 * @returns {Promise<void>}
 */
async function userData (confirmPassword) {
    const form = document.getElementById("sign_log_in_id");
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries())
    form.reset();
    registerNewUser(values);
}


// Main Function
  export function getSignUpErrorElements() {
    return {
      username: {
        input: document.getElementById('sign_up_username_input'),
        error: document.getElementById('error_sign_up_username'),
      },
      email: {
        input: document.getElementById('sign_up_email_input'),
        error: document.getElementById('error_sign_up_email'),
      },
      password: {
        input: document.getElementById('sign_up_password_input'),
        error: document.getElementById('error_sign_up_password'),
      },
      confirmPassword: {
        input: document.getElementById('sign_up_confirm_password_input'),
        error: document.getElementById('error_sign_up_password_match'),
      },
      privacyCheckbox: {
        input: document.getElementById('sign_up_checkbox'),
        error: document.getElementById('error_sign_up_privacy_checkbox'),
      },
    };
  }

  export function attachSignUpValidation(elements) {
    enableValidationOnFocus(elements.username.input, elements.username.error, validateName, 'Field must not be empty.');
    enableValidationOnFocus(elements.email.input, elements.email.error, validateEmail, 'Field must not be empty.');
    enableValidationOnFocus(elements.password.input, elements.password.error, validatePassword, 'Field must not be empty.');
  
    enableValidationOnFocus(
      elements.confirmPassword.input,
      elements.confirmPassword.error,
      (value) => validateConfirmPassword(elements.password.input.value, value),
      'Field must not be empty.'
    );
    elements.password.input.addEventListener('input', () => {
        if (elements.confirmPassword.input.value) {
          showError(
            elements.confirmPassword.input,
            elements.confirmPassword.error,
            validateConfirmPassword(elements.password.input.value, elements.confirmPassword.input.value)
          );
        }
      });
    elements.privacyCheckbox.input.addEventListener('change', () => {
      elements.privacyCheckbox.error.textContent = validateTerms(elements.privacyCheckbox.input.checked);
    });
  }

  function enableValidationOnFocus(input, errorEl, validateFn, emptyMessage) {
    input.addEventListener('focus', () => {
      if (!input.value) {
        showError(errorEl, emptyMessage);
      }
    });
  
    input.addEventListener('input', () => {
      showError(errorEl, validateFn(input.value));
    });
  }

  function showError (errorEl, errorMessage) {
    errorEl.classList.toggle('hidden_errors', !errorMessage)
    errorEl.textContent = errorMessage;
  }

  function validateName(value) {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return 'Name must not be empty.';
    }
    if (trimmedValue.length < MIN_NAME_LENGTH) {
      return `Name must >${MIN_NAME_LENGTH} characters.`;
    }
    if (trimmedValue.length > MAX_NAME_LENGTH) {
      return `Name must <${MAX_NAME_LENGTH} characters.`;
    }
    if (!NAME_REGEX.test(trimmedValue)) {
      return 'No numbers or special characters.';
    }
    return '';
  }


function validateEmail(value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return 'Email must not be empty.';
  }
  if (!EMAIL_REGEX.test(trimmedValue)) {
    return 'Enter a valid email address.';
  }

  return '';
}

function validatePassword(value) {
    if (!value) {
      return 'Password must not be empty.';
    }
    if (value.length < MIN_PASSWORD_LENGTH) {
      return `Password must >${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (!/[A-Z]/.test(value)) {
      return 'Needs an uppercase letter.';
    }
    if (!/[a-z]/.test(value)) {
      return 'Needs an lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return 'Needs a number.';
    }
    return '';
  }

  function validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
      return 'Field must not be empty.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  }


  // Checkbox noch überprüfen

