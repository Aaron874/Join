export function setGuestSession() {
    localStorage.setItem(
        'guest',
        'true'
    );
}

export function clearGuestSession() {
    localStorage.removeItem(
        'guest'
    );
}

export function isGuest() {
    return localStorage.getItem(
        'guest'
    ) === 'true';
}