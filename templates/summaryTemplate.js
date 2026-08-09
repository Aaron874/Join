function getSummaryTemplate(summaryData) {
return `
<section class="summary-wrapper">
    <div class="summary-heading">
        <h1>Join 360</h1>
        <span class="summary-heading-line"></span>
        <p>Key Metrics at a Glance</p>
    </div>

    <div class="summary-dashboard">
        <div class="summary-metrics">
            ${getSummaryTopCardsTemplate(summaryData)}
            ${getSummaryUrgentTemplate(summaryData)}
            ${getSummaryBottomCardsTemplate(summaryData)}
        </div>

        ${getSummaryGreetingTemplate(summaryData)}
    </div>
</section>
`;
}

function getSummaryTopCardsTemplate(summaryData) {
return `
<div class="summary-top-cards">
    <a class="summary-card summary-card-wide" href="board.html">
        <span class="summary-icon summary-icon-todo">
            <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="34.5" cy="34.5" r="34.5" fill="#2A3647" />

                <mask id="todo-icon-mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="18" y="18" width="33"
                    height="33">
                    <rect x="18.5" y="18.5" width="32" height="32" fill="#D9D9D9" />
                </mask>

                <g mask="url(#todo-icon-mask)">
                    <path
                        d="M25.1667 43.8332H27.0333L38.5333 32.3332L36.6667 30.4665L25.1667 41.9665V43.8332ZM44.2333 30.3998L38.5667 24.7998L40.4333 22.9332C40.9444 22.4221 41.5722 22.1665 42.3167 22.1665C43.0611 22.1665 43.6889 22.4221 44.2 22.9332L46.0667 24.7998C46.5778 25.3109 46.8444 25.9276 46.8667 26.6498C46.8889 27.3721 46.6444 27.9887 46.1333 28.4998L44.2333 30.3998ZM42.3 32.3665L28.1667 46.4998H22.5V40.8332L36.6333 26.6998L42.3 32.3665Z"
                        fill="white" />
                </g>
            </svg>
        </span>

        <div>
            <strong>${summaryData.todo}</strong>
            <span>To-do</span>
        </div>
    </a>

    <a class="summary-card summary-card-wide" href="board.html">
        <span class="summary-icon summary-icon-done">
            <svg width="69" height="69" viewBox="0 0 69 69" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="34.5" cy="34.5" r="34.5" fill="#2A3647" />

                <path d="M19.5283 34.5001L30.7571 45.5662L49.4717 23.4341" stroke="white" stroke-width="7"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </span>

        <div>
            <strong>${summaryData.done}</strong>
            <span>Done</span>
        </div>
    </a>
</div>
`;
}

function getSummaryUrgentTemplate(summaryData) {
return `
<a class="summary-card summary-urgent-card" href="board.html">
    <div class="summary-urgent-count">
        <span class="summary-icon summary-icon-urgent">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="30" fill="#FF3D00" />
                <g clip-path="url(#clip0_489553_4)">
                    <path
                        d="M44.8712 41.1626C44.4701 41.1633 44.0794 41.0337 43.7566 40.7929L29.6513 30.263L15.5461 40.7929C15.3481 40.941 15.1231 41.0482 14.8842 41.1084C14.6452 41.1685 14.3969 41.1805 14.1534 41.1435C13.9098 41.1066 13.6759 41.0214 13.4649 40.893C13.2539 40.7645 13.07 40.5953 12.9236 40.3949C12.7772 40.1945 12.6713 39.9669 12.6119 39.7251C12.5524 39.4832 12.5406 39.2319 12.5771 38.9855C12.6509 38.4878 12.917 38.0402 13.317 37.7411L28.5368 26.3677C28.8593 26.126 29.25 25.9956 29.6513 25.9956C30.0526 25.9956 30.4434 26.126 30.7659 26.3677L45.9857 37.7411C46.3035 37.9781 46.5392 38.3106 46.6591 38.6912C46.779 39.0718 46.777 39.481 46.6534 39.8604C46.5298 40.2398 46.291 40.57 45.9709 40.8039C45.6508 41.0377 45.2659 41.1633 44.8712 41.1626Z"
                        fill="white" />
                    <path
                        d="M44.8709 31.2109C44.4699 31.2116 44.0792 31.082 43.7564 30.8413L29.6511 20.3114L15.5458 30.8413C15.1459 31.1404 14.6449 31.2665 14.1531 31.1919C13.6613 31.1172 13.219 30.8479 12.9234 30.4432C12.6278 30.0385 12.5031 29.5315 12.5769 29.0339C12.6507 28.5362 12.9168 28.0885 13.3167 27.7894L28.5365 16.416C28.8591 16.1744 29.2498 16.0439 29.6511 16.0439C30.0524 16.0439 30.4431 16.1744 30.7657 16.416L45.9855 27.7894C46.3033 28.0264 46.5389 28.359 46.6589 28.7396C46.7788 29.1202 46.7768 29.5294 46.6532 29.9088C46.5296 30.2882 46.2907 30.6184 45.9706 30.8522C45.6506 31.0861 45.2657 31.2116 44.8709 31.2109Z"
                        fill="white" />
                </g>
                <defs>
                    <clipPath id="clip0_489553_4">
                        <rect width="34.186" height="25.1163" fill="white" transform="translate(12.5581 16.0464)" />
                    </clipPath>
                </defs>
            </svg>

        </span>

        <div>
            <strong>${summaryData.urgent}</strong>
            <span>Urgent</span>
        </div>
    </div>

    <span class="summary-divider"></span>

    <div class="summary-deadline">
        <strong>${summaryData.deadline}</strong>
        <span>Upcoming Deadline</span>
    </div>
</a>
`;
}

function getSummaryBottomCardsTemplate(summaryData) {
return `
<div class="summary-bottom-cards">
    <a class="summary-card summary-card-small" href="board.html">
        <strong>${summaryData.total}</strong>
        <span>Tasks in<br>Board</span>
    </a>

    <a class="summary-card summary-card-small" href="board.html">
        <strong>${summaryData.inProgress}</strong>
        <span>Tasks In<br>Progress</span>
    </a>

    <a class="summary-card summary-card-small" href="board.html">
        <strong>${summaryData.awaitFeedback}</strong>
        <span>Awaiting<br>Feedback</span>
    </a>
</div>
`;
}

function getSummaryGreetingTemplate(summaryData) {
    const punctuation = summaryData.userName ? ',' : '!';
    return `
        <div class="summary-greeting">
            <span>${summaryData.greeting}${punctuation}</span>
            ${summaryData.userName ? `<strong>${summaryData.userName}</strong>` : ''}
        </div>
    `;
}