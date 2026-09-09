/*global document */

/**
 * Adds sequential line-number IDs (e.g. "line1", "line2", ...) to each line of a
 * syntax-highlighted source code block, and highlights the line matching the current URL hash
 * (if any) by adding a "selected" class to it. Used for deep-linking to specific lines in
 * generated documentation source views.
 */
(() => {
    const source = document.getElementsByClassName('prettyprint source linenums');
    let i = 0;
    let lineNumber = 0;
    let lineId;
    let lines;
    let totalLines;
    let anchorHash;

    if (source && source[0]) {
        anchorHash = document.location.hash.substring(1);
        lines = source[0].getElementsByTagName('li');
        totalLines = lines.length;

        for (; i < totalLines; i++) {
            lineNumber++;
            lineId = `line${lineNumber}`;
            lines[i].id = lineId;
            if (lineId === anchorHash) {
                lines[i].className += ' selected';
            }
        }
    }
})();
