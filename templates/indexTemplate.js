
/**
 * Return the HTML template for the sign-up form.
 *
 * @returns {string} HTML string for the user sign-up form.
 */
function signUpTemplate() {
    return `
                    <h1 id="header_log_sign" >Sign up</h1>
                    <div class="login_input_wrapper">
                        <input
                            type="text"
                            name="username"
                            placeholder="Name"
                            id="sign_up_username_input"
                            autocomplete="off"
                        />
                        <img src="assets/img/person_16_16_sign_up.webp" alt="Person Icon" />
                    </div>
                    <div id="error_sign_up_username" class="alert_log_in hidden_errors" role="alert" aria-live="assertive">
                    Username required
                    </div>
                    <div class="login_input_wrapper">
                        <input
                            type="email"
                            name="email"
                            id="sign_up_email_input"
                            placeholder="Email"
                            autocomplete="off"
                        />
                        <img src="assets/img/mail_login_sign.webp" alt="Mail Icon" />
                    </div>
                    <div id="error_sign_up_email" class="alert_log_in hidden_errors" role="alert" aria-live="assertive">
                    E-mail required
                    </div>
                    <div class="login_input_wrapper">
                        <input
                            type="password"
                            name="password"
                            id="sign_up_password_input"
                            placeholder="Password"
                            autocomplete="off"
                        />
                        <img src="assets/img/lock.webp" alt="Lock Icon" />
                    </div>
                    <div id="error_sign_up_password" class="alert_log_in hidden_errors" role="alert" aria-live="assertive">
                    Password required
                    </div>
                    <div class="login_input_wrapper">
                        <input
                            type="password"
                            name="confirmPassword"
                            id="sign_up_confirm_password_input"
                            placeholder="Confirm Password"
                            autocomplete="off"
                        />
                        <img src="assets/img/lock.webp" alt="Lock Icon" />
                    </div>
                    <div id="error_sign_up_password_match" class="alert_log_in hidden_errors" role="alert" aria-live="assertive">
                    Passwords do not match
                    </div>
                    <div class="privacy_checkbox">
                        <input type="checkbox" name="Privacy Policy Checkbox" id="sign_up_checkbox"/>
                        <p>I accept the <a href="policy.html">Privacy Policy</a></p>
                    </div>
                    <div id="error_sign_up_privacy_checkbox" class="alert_log_in hidden_errors" role="alert" aria-live="assertive">
                    Please accept privacy for sign up
                    </div>
                <div
                    id="sign_up_error_id"
                    class="alert_sign_up hidden_errors"
                    role="alert"
                    aria-live="assertive"
                >
                    Sign up failed. Please try again.
                </div>
                    <button class="sign_up_btn" type="submit" data-action="signUp">Sign up</button>
`;
    
}

/**
 * Return the HTML template for the sign-in form.
 *
 * @returns {string} HTML string for the user log-in form.
 */
function signInTemplate() {
    return `
                    <h1 id="header_log_sign" >Log in</h1>
                    <div class="login_input_wrapper">
                    <input  type="email" name="email" 
                    id="login_email_id"
                    placeholder="Email"
                    >
                <img src="assets/img/mail_login_sign.webp" alt="E-Mail Icon">
                </div>
                <div id="error_log_in_email" class="alert_log_in hidden_errors" role="alert" aria-live="assertive">
                    Email required
                </div>
                <div class="login_input_wrapper">
                    <input  type="password" 
                    name="password" 
                    id="login_password_id"
                    placeholder="Password"
                    >
                <img src="assets/img/lock.webp" alt="password lock sign">
                </div>
                <div
                    id="error_log_in_password_or_both"
                    class="alert_log_in hidden_errors"
                    role="alert"
                    aria-live="assertive"
                >
                    Username or Password incorrect
                </div>        
                <div class="login_btn_wrapper">
                    <button class="login_btn" type="submit" data-action="logIn">Log in</button>
                    <button class="guest_login_btn">Guest Log in</button>
                </div>

    `;
}