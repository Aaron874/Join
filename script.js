

/**
 * Handles the logged-in user UI for the application.
 * This module updates the user avatar icon, manages the user menu,
 * and provides helper functions for authentication state handling.
 */
const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/';

import { auth } from '../firebase/firebase-config.js';
import { getUserProfile } from '../firebase/user.service.js';
import { logout } from './firebase/auth.js';

import {
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';


document.addEventListener('DOMContentLoaded', initLoggedInUserIcon);

/**
 * Initializes the logged-in user icon and listens for authentication changes.
 */
function initLoggedInUserIcon() {
    const userIcon = document.getElementById('loged-in-user');

    if (!userIcon) return;

    onAuthStateChanged(auth, user => {
        updateLoggedInUserIcon(userIcon, user);
    });
}

/**
 * Updates the visible user icon based on the current authentication state.
 *
 * @param {HTMLElement} userIcon - The DOM element representing the user icon.
 * @param {object | null} user - The authenticated user object or null.
 */
async function updateLoggedInUserIcon(userIcon, user) {
    if (!user) {
        userIcon.hidden = true;
        return;
    }
    userIcon.hidden = false;

    if (user.isAnonymous) {
        setGuestIcon(userIcon);
        return;
    }
    const userName = await getLoggedInUserName(user);
    const initials = getUserInitials(userName);

    userIcon.textContent = initials || getEmailInitials(user.email);
    userIcon.title = userName || user.email || 'User';
}

/**
 * Retrieves the current user's display name from the profile service.
 *
 * @param {object} user - The authenticated user object.
 * @returns {Promise<string>} The resolved display name or an empty string.
 */
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

/**
 * Creates initials from a user name.
 *
 * @param {string} userName - The full user name.
 * @returns {string} The generated initials.
 */
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

/**
 * Creates initials from an email address.
 *
 * @param {string} email - The user's email address.
 * @returns {string} The generated initials.
 */
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

/**
 * Sets the user icon to the guest placeholder state.
 *
 * @param {HTMLElement} userIcon - The DOM element representing the user icon.
 */
function setGuestIcon(userIcon) {
    userIcon.textContent = 'G';
    userIcon.title = 'Guest';
}

/**
 * Returns the current registered user's display name.
 *
 * @returns {Promise<string>} A promise that resolves to the user's name.
 */
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

/**
 * Toggles the visibility of the user dropdown menu.
 *
 * @param {MouseEvent} event - The click event that triggered the action.
 */
function toggleUserMenu(event) {
    event.stopPropagation();
    document.getElementById('user-menu')?.classList.toggle('open');
}

/**
 * Closes the user dropdown menu.
 */
function closeUserMenu() {
    document.getElementById('user-menu')?.classList.remove('open');
}

document.addEventListener('click', event => {
    const menu = event.target.closest('#user-menu');
    if (!event.target.closest('#loged-in-user') &&
        (!menu || event.target.closest('a, button'))) closeUserMenu();
});

/**
 * Logs out the current user and redirects to the landing page.
 *
 * @returns {Promise<void>} A promise that resolves when the logout completes.
 */
async function logoutCurrentUser() {
    try {
        await logout();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout fehlgeschlagen:', error);
    }
}

window.logoutCurrentUser = logoutCurrentUser;

window.toggleUserMenu = toggleUserMenu;