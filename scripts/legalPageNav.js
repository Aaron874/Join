import { auth } from '../firebase/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/**
 * Switches legal.html/policy.html between the full app navigation (sidebar,
 * mobile footer nav) and a plain "back to login" link, depending on whether
 * a user is currently authenticated. These pages are reachable both from
 * within the app (registered users and guests) and directly from the login
 * screen, where no one is signed in yet and the app navigation makes no
 * sense.
 *
 * @returns {void}
 *
 * @example
 * // Loaded once via <script type="module" src="./scripts/legalPageNav.js">
 * // on legal.html and policy.html.
 */
onAuthStateChanged(auth, (user) => {
    document.body.classList.toggle('logged-out', !user);
});
