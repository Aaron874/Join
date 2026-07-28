// import { loginUser } from '../auth/auth.service.js'
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

            userData(confirmPassword);
            break;
    }
});

async function mainLogIn()  {
    let user = await loginUser(email, password)
}

function userData (confirmPassword) {
    const form = document.getElementById("sign_log_in_id");
    const formData = new FormData(form);

    const values = Object.fromEntries(formData.entries())
    console.log(values.password, values.confirmPassword);
    
    if (values.password !== values.confirmPassword) {
        confirmPassword.setCustomValidity("Passwords do not match");
        confirmPassword.reportValidity();
        return;
      }

    console.log(values);
    form.reset();
    
}