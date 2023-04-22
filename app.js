//Globals:
const todoList = document.getElementById('todo-list');
const userSelect = document.getElementById('user-todo');
const form = document.querySelector('form');
let todos = []; //Полученые данные с сервера
let users = []; //Полученые данные с сервера

// Attach events
document.addEventListener('DOMContentLoaded', initApp); //Вызов функции инициализации приложения после полной отрисовки страницы
form.addEventListener('submit', handleSubmit); //

//Basic logic:
//Функция получения имени пользователя по userId
function getUserName(userId) {
    const user = users.find((el) => el.id === userId);
    return user.name;
}

//Функция отрисовки полученных данных в HTML разметке
function printTodo({ id, userId, title, completed }) {
    //Создание элемента <li> с названием задачи и именем автора
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = id;
    li.innerHTML = `<span>${title}<i> by </i><b>${getUserName(
        userId
    )}</b></span>`;

    //Создание чекбокса со статусом выполнения задачи
    const status = document.createElement('input');
    status.type = 'checkbox';
    status.checked = completed;
    status.addEventListener('change', handleTodoChange); //При смене статуса чекбокса, вызов функции обработки статуса

    //Создание кнопки удаления задачи (Х)
    const close = document.createElement('span');
    close.innerHTML = '&times;';
    close.className = 'close';
    close.addEventListener('click', handleClose); //При клике на кнопку удаления, вывоз функции обработки клика

    li.prepend(status); //Отрисовка status
    li.append(close); //Отрисовка close
    todoList.prepend(li); //Отрисовка li
}

//Функция отрисовки выпадающего списка с пользователями
function createUserOption(user) {
    const option = document.createElement('option');
    option.value = user.id;
    option.innerText = user.name;

    userSelect.append(option);
}

//Функция удаления задачи из HTML-разметки по нажатию кнопки (Х)
function removeTodo(todoId) {
    todos = todos.filter((el) => el !== todoId); //Удаление задачи из глобальной переменной todos
    const todo = todoList.querySelector(`[data-id="${todoId}"]`);
    todo.querySelector('input').removeEventListener('change', handleTodoChange);
    todo.querySelector('.close').removeEventListener('click', handleClose);
    todo.remove();
}

//Функция показа модального окна с ошибкой
function modalAlertError(error) {
    const modal = document.querySelector('.modal');
    const close = modal.querySelector('.modal__close-btn');
    modal.querySelector('.modal__text').textContent = `${error}`;
    modal.classList.add('show-modal');
    close.addEventListener('click', removeModalError);
}

//Функция закрытию модального окна с ошибкой
function removeModalError() {
    const modal = document.querySelector('.modal');
    const close = modal.querySelector('.modal__close-btn');
    modal.classList.remove('show-modal');
    close.removeEventListener('click', removeModalError);
}

//Event logic:
//Функция инициализации приложения
function initApp() {
    Promise.all([getAllToDos(), getAllUsers()]).then((values) => {
        [todos, users] = values;

        //отправить в разметку
        todos.forEach((todo) => printTodo(todo));
        users.forEach((user) => createUserOption(user));
    });
}

//Функция обработки клика на кнопку удаления задачи
function handleClose() {
    const todoId = this.parentElement.dataset.id; //Получение значения дата-атрибута id у родительского элемента

    //Вызов асинхронной функции с передачей данных (id задачи)
    deleteToDo(todoId);
}

//Функция обработки данных с формы по нажатию на кнопку
function handleSubmit(event) {
    event.preventDefault(); //Отмена стандартной синхронной отправки формы на сервер

    //Вызов асинхронной функции с передачей данных с формы
    createToDo({
        userId: Number(form.user.value),
        title: form.todo.value,
        completed: false,
    });
}

//Функция обработки статуса чекбокса
function handleTodoChange() {
    const todoId = this.parentElement.dataset.id; //Получение значения дата-атрибута id у родительского элемента
    const status = this.checked;
    toggleToDoStatus(todoId, status);
}

//Async logic:
//Асинхронные функции с запросами данных с сервера

//Запрос всех задач
async function getAllToDos() {
    try {
        const response = await fetch(
            'https://jsonplaceholder.typicode.com/todos?_limit=10'
        );
        const data = response.json();

        return data;
    } catch (error) {
        modalAlertError(error);
    }
}

//Запрос всех пользователей
async function getAllUsers() {
    try {
        const response = await fetch(
            'https://jsonplaceholder.typicode.com/users?_limit=10'
        );
        const data = response.json();
        return data;
    } catch (error) {
        modalAlertError(error);
    }
}

//Создание новой задачи
async function createToDo(todo) {
    try {
        const response = await fetch(
            'https://jsonplaceholder.typicode.com/todos?_limit=10',
            {
                method: 'POST',
                body: JSON.stringify(todo), //преобразования объекта в JSON-строку
                headers: {
                    'Content-type': 'application/json', //Ожидание ответа в виде  json строки
                },
            }
        );

        const newTodo = await response.json();
        printTodo(newTodo); //Вызов функции отрисовки полученных данных в HTML разметке
    } catch (error) {
        modalAlertError(error);
    }
}

//Изменение статуса задачи (активность чекбокса)
async function toggleToDoStatus(todoId, status) {
    try {
        const response = await fetch(
            `https://jsonplaceholder.typicode.com/todos/${todoId}`,
            {
                method: 'PATCH',
                body: JSON.stringify({ completed: status }),
                headers: {
                    'Content-type': 'application/json', //Ожидание ответа в виде  json строки
                },
            }
        );

        if (!response.ok) {
            throw new Error( //Ошибка если ответ сервера отрицательный
                'Failed to connect width the server! Please try later.'
            );
        }
    } catch (error) {
        modalAlertError(error);
    }
}

//Удаление задачи
async function deleteToDo(todoId) {
    try {
        const response = await fetch(
            `https://jsonplaceholder.typicode.com/todos/${todoId}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-type': 'application/json', //Ожидание ответа в виде  json строки
                },
            }
        );

        if (response.ok) {
            removeTodo(todoId); //Если действие выполнено, вызов функции удаления задачи из HTML-разметки
        } else {
            throw new Error(
                'Failed to connect width the server! Please try later.'
            );
        }
    } catch (error) {
        modalAlertError(error);
    }
}
