const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/';

import { auth } from '../firebase/firebase-config.js';
import { getUserProfile } from '../firebase/user.service.js';

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