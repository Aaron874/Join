import { auth } from '../firebase/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/**
 * Switches legal.html/policy.html between the full app navigation (sidebar,
 * mobile footer nav) and the guest footer nav (Log In / Privacy Policy /
 * Legal Notice), depending on whether a user is currently authenticated.
 * These pages are reachable both from within the app (registered users and
 * guests) and directly from the login screen, where no one is signed in yet.
 *
 * Neither `logged-in` nor `logged-out` is set on `<body>` until Firebase
 * reports the actual auth state, so the app navigation never flashes on
 * screen before being hidden again.
 *
 * @returns {void}
 *
 * @example
 * // Loaded once via <script type="module" src="./scripts/legalPageNav.js">
 * // on legal.html and policy.html.
 */
onAuthStateChanged(auth, (user) => {
    document.body.classList.toggle('logged-in', !!user);
    document.body.classList.toggle('logged-out', !user);
});
