import { auth } from '../firebase/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';


/**
 * Listens for Firebase auth state changes and reflects the current login state on the body
 * element via "logged-in"/"logged-out" classes, allowing CSS to show/hide UI based on
 * authentication status.
 */
onAuthStateChanged(auth, (user) => {
    document.body.classList.toggle('logged-in', !!user);
    document.body.classList.toggle('logged-out', !user);
});
