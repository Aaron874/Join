import { auth } from '../firebase/firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
    document.body.classList.toggle('logged-in', !!user);
    document.body.classList.toggle('logged-out', !user);
});
