// window.addEventListener('DOMContentLoaded', init);

// // const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/';

// let fetchedTasks = [];

// async function init() {
//     await fetchTasks();
//     renderBoard();
//     initDragAndDrop();
// }

// function openDialog(id) {
//     document.getElementById(id).showModal();
// }

// function closeDialog(id) {
//     document.getElementById(id).close();
// }

// // async function fetchTasks(path = "tasks") {
// //     try {
// //         let response = await fetch(BASE_URL + path + ".json");
// //         if (!response.ok) {
// //             throw new Error(`HTTP-Fehler! Status: ${response.status}`);
// //         }
// //         const taskData = await response.json();
// //         fetchedTasks = Object.entries(taskData || {}).map(
// //             ([id, task]) => ({id, ...task})
// //         )
// //         console.log(fetchedTasks);
// //     } catch (error) {
// //         console.error('Fehler beim Abrufen', error.message);
// //         fetchedTasks = [];
// //     } finally {
// //         if (!fetchedTasks || !fetchedTasks.length) {
// //             return
// //         }
// //     }
// // }


// async function fetchTasks(path = 'tasks') {
//     try {
//         const response = await fetch(
//             `${BASE_URL}${path}.json`
//         );
//         if (!response.ok) {
//             throw new Error(
//                 `HTTP-Fehler: ${response.status}`
//             );
//         }
//         const data = await response.json();
//         fetchedTasks = Object.entries(data ?? {}).map(
//             ([id, task]) => ({
//                 id, ...task,
//             })
//         );
//         return fetchedTasks;
//     } catch (error) {
//         console.error(
//             'Fehler beim Abrufen:',
//             error
//         );
//         fetchedTasks = [];
//         return [];
//     }
// }



// function renderColumn(status, container) {
//     container.innerHTML = fetchedTasks
//         .filter(({ status: taskStatus }) => taskStatus === status)
//         .map(getTaskTemplate)
//         .join('');
// }

// function renderBoard() {
//     const columns = {
//         todo: 'todo-container',
//         inProgress: 'progress-container',
//         awaitFeedback: 'feedback-container',
//         done: 'done-container',
//     };

//     Object.entries(columns).forEach(([status, containerId]) => {
//         renderColumn(status, document.getElementById(containerId));
//     });
// }
// let draggedTaskId = null;

// function handleDragStart(event) {
//     draggedTaskId =
//         event.currentTarget.dataset.taskId;

//     event.currentTarget.classList.add(
//         'dragging'
//     );
// }

// function handleDragEnd(event) {
//     event.currentTarget.classList.remove(
//         'dragging'
//     );

//     draggedTaskId = null;
// }

// function initDragAndDrop() {
//     document
//         .querySelectorAll('[data-status]')
//         .forEach(column => {
//             column.addEventListener(
//                 'dragover',
//                 handleDragOver
//             );

//             column.addEventListener(
//                 'drop',
//                 handleDrop
//             );
//         });
// }

// function handleDragOver(event) {
//     event.preventDefault();
// }

// async function handleDrop(event) {
//     event.preventDefault();

//     const column =
//         event.target.closest('[data-status]');

//     if (!column || !draggedTaskId) {
//         return;
//     }

//     const newStatus =
//         column.dataset.status;

//     const task =
//         fetchedTasks.find(
//             task =>
//                 task.id === draggedTaskId
//         );

//     if (!task) return;

//     try {
//         await fetch(
//             `${BASE_URL}tasks/${draggedTaskId}.json`,
//             {
//                 method: 'PATCH',
//                 headers: {
//                     'Content-Type':
//                         'application/json',
//                 },
//                 body: JSON.stringify({
//                     status: newStatus,
//                 }),
//             }
//         );

//         task.status = newStatus;

//         renderBoard();

//     } catch (error) {
//         console.error(error);
//     }
// }

window.addEventListener('DOMContentLoaded', init);

let fetchedTasks = [];
let draggedTaskId = null;

async function init() {
    await fetchTasks();
    renderBoard();
    initDragAndDrop();
}

function openDialog(id) {
    document.getElementById(id).showModal();
}

function closeDialog(id) {
    document.getElementById(id).close();
}

async function fetchTasks(path = 'tasks') {
    try {
        const response = await fetch(`${BASE_URL}${path}.json`);

        if (!response.ok) {
            throw new Error(`HTTP-Fehler: ${response.status}`);
        }

        const data = await response.json();

        fetchedTasks = Object.entries(data ?? {}).map(([id, task]) => ({
            ...task,
            id,
        }));

        return fetchedTasks;
    } catch (error) {
        console.error('Fehler beim Abrufen:', error);
        fetchedTasks = [];
        return [];
    }
}

function renderColumn(status, container) {
    const tasks = fetchedTasks
        .filter(task => task.status === status)
        .map(getTaskTemplate)
        .join('');

    container.innerHTML = tasks || getEmptyColumnTemplate(status);
}

function renderBoard() {
    const columns = {
        todo: 'todo-container',
        inProgress: 'progress-container',
        awaitFeedback: 'feedback-container',
        done: 'done-container',
    };

    Object.entries(columns).forEach(([status, containerId]) => {
        renderColumn(status, document.getElementById(containerId));
    });
}

function initDragAndDrop() {
    document.querySelectorAll('.task-queue').forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(event) {
    draggedTaskId = event.currentTarget.dataset.taskId;
    event.currentTarget.classList.add('dragging');
}

function handleDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
    draggedTaskId = null;
}

function handleDragOver(event) {
    event.preventDefault();
}

async function handleDrop(event) {
    event.preventDefault();

    const column = event.currentTarget;
    const newStatus = column.dataset.status;
    const task = getDraggedTask();

    console.log('draggedTaskId:', draggedTaskId);
    console.log('newStatus:', newStatus);
    console.log('task:', task);
    console.log('updateUrl:', `${BASE_URL}tasks/${draggedTaskId}.json`);

    if (!task || task.status === newStatus) return;

    try {
        await updateTaskStatus(task.id, newStatus);
        await fetchTasks();

        console.log('afterFetch:', fetchedTasks);

        renderBoard();
    } catch (error) {
        console.error('Drop fehlgeschlagen:', error);
    }
}


function getDraggedTask() {
    return fetchedTasks.find(task => task.id === draggedTaskId);
}

async function updateTaskStatus(taskId, status) {
    const response = await fetch(`${BASE_URL}tasks/${taskId}/status.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
    });

    if (!response.ok) {
        throw new Error(`Firebase Update fehlgeschlagen: ${response.status}`);
    }

    return await response.json();
}

function getEmptyColumnTemplate(status) {
    const texts = {
        todo: 'No tasks To do',
        inProgress: 'No tasks in progress',
        awaitFeedback: 'No tasks await feedback',
        done: 'No tasks done',
    };

    return `<div class="notask">${texts[status]}</div>`;
}