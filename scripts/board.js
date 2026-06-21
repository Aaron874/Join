window.addEventListener('DOMContentLoaded', init);

// const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/';

let fetchedTasks = [];

async function init() {
    await fetchTasks();
    renderBoard();
}

function openDialog(id) {
    document.getElementById(id).showModal();
}

function closeDialog(id) {
    document.getElementById(id).close();
}

async function fetchTasks(path = "tasks") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        const taskData = await response.json();
        fetchedTasks = Object.entries(taskData || {}).map(
            ([id, task]) => ({id, ...task})
        )
        console.log(fetchedTasks);
    } catch (error) {
        console.error('Fehler beim Abrufen', error.message);
        fetchedTasks = [];
    } finally {
        if (!fetchedTasks || !fetchedTasks.length) {
            return
        }
    }
}

function renderColumn(status, taskContainer) {
    taskContainer.replaceChildren();
    fetchedTasks
    .filter(task => task.status === status)
    .forEach(task => {
        taskContainer.appendChild(
            getTaskTemplate(task)
        );
    });
}

function renderBoard() {
    renderColumn('todo', document.getElementById('todo-container'));
    renderColumn('inProgress', document.getElementById('progress-container'));
    renderColumn('awaitFeedback', document.getElementById('feedback-container'));
    renderColumn('done', document.getElementById('done-container'));
}