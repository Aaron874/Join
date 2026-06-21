function getTaskTemplate(task) {
    const card = document.createElement('div');
    card.classList.add('task-card');
    const title = document.createElement('h3');
    title.textContent = task.title;
    card.appendChild(title);
    return card;
}