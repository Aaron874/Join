

const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/';

import { auth } from '../firebase/firebase-config.js';
import { getUserProfile } from '../firebase/user.service.js';
import { logout } from "./firebase/auth.js";

import {
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';


document.addEventListener('DOMContentLoaded', initLoggedInUserIcon);


function initLoggedInUserIcon() {
    const userIcon = document.getElementById('loged-in-user');

    if (!userIcon) return;

    onAuthStateChanged(auth, user => {
        updateLoggedInUserIcon(userIcon, user);
    });
}


async function updateLoggedInUserIcon(userIcon, user) {
    if (!user || user.isAnonymous) {
        setGuestIcon(userIcon);
        return;
    }

    const userName = await getLoggedInUserName(user);
    const initials = getUserInitials(userName);

    userIcon.textContent = initials || getEmailInitials(user.email);
    userIcon.title = userName || user.email || 'User';
}


async function getLoggedInUserName(user) {
    try {
        const userProfile = await getUserProfile();

        return (
            userProfile?.username ??
            userProfile?.name ??
            user.displayName ??
            ''
        );
    } catch (error) {
        console.error(
            'Benutzerprofil konnte nicht geladen werden:',
            error
        );

        return user.displayName ?? '';
    }
}


function getUserInitials(userName) {
    const nameParts = userName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (nameParts.length === 0) return '';

    if (nameParts.length === 1) {
        return nameParts[0][0].toUpperCase();
    }

    const firstInitial = nameParts[0][0];
    const lastInitial = nameParts.at(-1)[0];

    return `${firstInitial}${lastInitial}`.toUpperCase();
}


function getEmailInitials(email) {
    if (!email) return 'U';

    const emailName = email.split('@')[0];

    return emailName
        .split(/[._-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join('');
}


function setGuestIcon(userIcon) {
    userIcon.textContent = 'G';
    userIcon.title = 'Guest';
}

window.getCurrentRegisteredUserName = function () {
    return new Promise(resolve => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            unsubscribe();

            if (!user || user.isAnonymous) {
                resolve('');
                return;
            }

            const userName = await getLoggedInUserName(user);
            resolve(userName);
        });
    });
};

function toggleUserMenu(event) {
    event.stopPropagation();
    document.getElementById('user-menu')?.classList.toggle('open');
}

function closeUserMenu() {
    document.getElementById('user-menu')?.classList.remove('open');
}

document.addEventListener('click', event => {
    const menu = event.target.closest('#user-menu');
    if (!event.target.closest('#loged-in-user') &&
        (!menu || event.target.closest('a, button'))) closeUserMenu();
});

async function logoutCurrentUser() {
    try {
        await logout();
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout fehlgeschlagen:", error);
    }
}

window.logoutCurrentUser = logoutCurrentUser;

window.toggleUserMenu = toggleUserMenu;