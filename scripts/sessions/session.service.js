/**
 * Marks the current session as a guest session by setting a flag in localStorage.
 *
 * @returns {void}
 */
export function setGuestSession() {
    localStorage.setItem('guest', 'true');
}

/**
 * Removes the guest session flag from localStorage, ending the current guest session.
 *
 * @returns {void}
 */
export function clearGuestSession() {
    localStorage.removeItem('guest');
}

/**
 * Checks whether the current session is a guest session, based on the flag stored in
 * localStorage.
 *
 * @returns {boolean} True if the current session is a guest session, false otherwise.
 */
export function isGuest() {
    return localStorage.getItem('guest') === 'true';
}
