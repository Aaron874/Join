import {
    observeAuth
} from '../auth/auth.service.js';

import {
    isGuest
} from '../sessions/session.service.js';

observeAuth(user => {
    protectRoute(user);
});

function protectRoute(user) {
    if (user || isGuest()) {
        return;
    }

    redirectToLogin();
}

function redirectToLogin() {
    location.href = '/login.html';
}