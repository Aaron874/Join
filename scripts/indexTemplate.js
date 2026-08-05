function signUpTemplate() {
    return `
                    <h1 id="header_log_sign" >Sign up</h1>
                    <div class="login_input_wrapper">
                        <input
                            type="text"
                            name="username"
                            placeholder="Name"
                            minlength="2"
                            maxlength="30"
                            pattern="[\\p{L}' \\-]{2,100}""
                            title="Der Name darf nur Buchstaben, Leerzeichen, Bindestriche und Apostrophe enthalten."
                            required
                        />
                        <img src="assets/img/person_16_16_sign_up.webp" alt="Person Icon" />
                    </div>
                    <div class="login_input_wrapper">
                        <input
                            type="email"
                            name="email"
                            id=""
                            placeholder="Email"
                            autocomplete="email"
                            required
                        />
                        <img src="assets/img/mail_login_sign.webp" alt="Mail Icon" />
                    </div>
                    <div class="login_input_wrapper">
                        <input
                            type="password"
                            name="password"
                            id=""
                            placeholder="Password"
                            minlength="12"
                            required
                        />
                        <img src="assets/img/lock.webp" alt="Lock Icon" />
                    </div>
                    <div class="login_input_wrapper">
                        <input
                            type="password"
                            name="confirmPassword"
                            id="confirm_password"
                            placeholder="Confirm Password"
                            required
                        />
                        <img src="assets/img/lock.webp" alt="Lock Icon" />
                    </div>
                    <div class="privacy_checkbox">
                        <input type="checkbox" name="Privacy Policy Checkbox" id="" required />
                        <p>I accept the <a href="policy.html">Privacy Policy</a></p>
                    </div>
                <div
                    id="sign_up_error_id"
                    class="alert_sign_up hidden"
                    role="alert"
                    aria-live="assertive"
                >
                    Diese E-Mail-Adresse ist bereits registriert.
                </div>
                    <button class="sign_up_btn" type="submit" data-action="signUp">Sign up</button>
`;            
}

function signInTemplate() {
    return `
                    <h1 id="header_log_sign" >Log in</h1>
                    <div class="login_input_wrapper">
                    <input  type="email" name="email" 
                    id="login_email_id"
                    placeholder="Email"
                    required
                    >
                <img src="assets/img/mail_login_sign.webp" alt="E-Mail Icon">
                </div>
                <div class="login_input_wrapper">
                    <input  type="password" 
                    name="password" 
                    id="login_password_id"
                    placeholder="Password"
                    required
                    >
                <img src="assets/img/lock.webp" alt="password lock sign">
                </div>
                <div
                    id="login_error_id"
                    class="alert_log_in hidden"
                    role="alert"
                    aria-live="assertive"
                >
                    Benutzername oder Passwort ist nicht korrekt.
                </div>        
                <div class="login_btn_wrapper">
                    <button class="login_btn" type="submit" data-action="logIn">Log in</button>
                    <button class="guest_login_btn">Guest Log in</button>
                </div>

    `;
}