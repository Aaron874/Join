function getTaskTemplate(task) {

    const card = document.createElement('div');
    card.classList.add('task-card');

    const category = document.createElement('span')
    category.textContent = task.category;
    card.appendChild(category);

    const title = document.createElement('h3');
    title.textContent = task.title;
    card.appendChild(title);

    const dueDate = document.createElement('p');
    dueDate.textContent = task.date;
    card.appendChild(dueDate);

    const description = document.createElement('p')
    description.textContent = task.description;
    card.appendChild(description);

    const subTask = document.createElement('p');
    subTask.textContent = task.subtasks;
    card.appendChild(subTask);

    const collaborators = document.createElement('span');
    collaborators.textContent = task.assignedTo;
    card.appendChild(collaborators);

    const priority = document.createElement('span');
    priority.textContent = task.priority;
    card.appendChild(priority);
    
    return card;
}