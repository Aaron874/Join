

/**
 * Get trimmed value from an input element by id.
 * @param {string} id
 * @returns {string}
 */
function getInputValue(id) {
    return getElement(id)?.value.trim() ?? '';
}
/**
 * Set value on an input element by id.
 * @param {string} id
 * @param {string} value
 */
function setInputValue(id, value) {
    const element = getElement(id);
    if (!element) return;
    element.value = value ?? '';
}

/**
 * Get trimmed textContent of an element by id.
 * @param {string} id
 * @returns {string}
 */
function getTextContent(id) {
    return getElement(id)?.textContent.trim() ?? '';
}

/**
 * Set textContent on an element. Optionally use querySelector instead of id lookup.
 * @param {string} selector - id or selector
 * @param {string} value
 * @param {boolean} [useSelector=false]
 */
function setTextContent(selector, value, useSelector = false) {
    const element = useSelector
        ? document.querySelector(selector)
        : getElement(selector);
    if (!element) return;
    element.textContent = value ?? '';
}

/**
 * Shorthand for document.getElementById.
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Open a native dialog element by id.
 * @param {string} id
 */
function openDialog(id) {
    getElement(id)?.showModal();
}

/**
 * Close a native dialog element by id.
 * @param {string} id
 */
function closeDialog(id) {
    getElement(id)?.close();
}

/**
 * Validate a fetch Response and throw an Error with provided message if not ok.
 * @param {Response} response
 * @param {string} message
 */
function validateResponse(response, message) {
    if (!response.ok) {
        throw new Error(`${message}: ${response.status}`);
    }
}

/**
 * Convert a date value to display format 'DD/MM/YYYY'. If already in that
 * format, returns unchanged.
 * @param {string} date
 * @returns {string}
 */
function formatDateForDisplay(date) {
    if (!date) return '';
    if (date.includes('/')) {
        return date;
    }
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Convert a date value to input format 'YYYY-MM-DD'. If already in that
 * format, returns unchanged.
 * @param {string} date
 * @returns {string}
 */
function formatDateForInput(date) {
    if (!date) return '';
    if (date.includes('-')) {
        return date;
    }
    const [day, month, year] = date.split('/');
    return `${year}-${month}-${day}`;
}