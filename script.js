document.addEventListener('DOMContentLoaded', () => {

    const Storage = {
        KEY: 'checklistTasks',
        load: () => {
            const storedTasks = localStorage.getItem(Storage.KEY);
            if (storedTasks) {
                return JSON.parse(storedTasks);
            }
            return [
                { id: 1, text: 'Reunião com a equipe', completed: true },
                { id: 2, text: 'Revisar documentação do projeto', completed: true },
                { id: 3, text: 'Preparar slides da apresentação', completed: false }
            ];
        },
        save: (tasks) => {
            localStorage.setItem(Storage.KEY, JSON.stringify(tasks));
        }
    };

    const DOM = {
        taskList: document.querySelector('.lista-tarefas'),
        statusText: document.querySelector('.status'),
        addTaskInput: document.querySelector('.add-tarefa input[type="text"]'),
        addTaskButton: document.querySelector('.add-tarefa .add-btn'),
        tabButtons: document.querySelectorAll('.tab'),
        tarefasSection: document.querySelector('.tarefas'),
        calendarioSection: document.querySelector('.calendario'),

        createTaskElement: (task) => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('tarefa');
            if (task.completed) taskDiv.classList.add('concluida');
            taskDiv.dataset.taskId = task.id;
            taskDiv.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <label>${task.text}</label>
            `;
            return taskDiv;
        },

        renderTasks: (tasks) => {
            DOM.taskList.innerHTML = '';
            tasks.forEach(task => DOM.taskList.appendChild(DOM.createTaskElement(task)));
            DOM.updateTaskStatus(tasks);
        },

        updateTaskStatus: (tasks) => {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.completed).length;
            DOM.statusText.textContent = `${completedTasks} de ${totalTasks} Concluídas`;
        },

        switchTab: (tabName) => {
            DOM.tabButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.includes(tabName)) btn.classList.add('active');
            });
            if (tabName === 'Tarefas') {
                DOM.tarefasSection.style.display = 'block';
                DOM.calendarioSection.style.display = 'none';
            } else {
                DOM.calendarioSection.style.display = 'block';
                DOM.tarefasSection.style.display = 'none';
            }
        }
    };

    const App = {
        tasks: [],

        init: () => {
            App.tasks = Storage.load();
            DOM.renderTasks(App.tasks);
            App.initListeners();
            DOM.calendarioSection.style.display = 'none';
            DOM.tarefasSection.style.display = 'block';
        },

        addTask: () => {
            const text = DOM.addTaskInput.value.trim();
            if (text === '') return;
            const newId = App.tasks.length > 0 ? Math.max(...App.tasks.map(t => t.id)) + 1 : 1;
            const newTask = { id: newId, text, completed: false };
            App.tasks.push(newTask);
            DOM.addTaskInput.value = '';
            App.refreshApp();
        },

        toggleTaskCompletion: (taskId) => {
            const taskIndex = App.tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                App.tasks[taskIndex].completed = !App.tasks[taskIndex].completed;
                App.refreshApp();
            }
        },

        refreshApp: () => {
            Storage.save(App.tasks);
            DOM.renderTasks(App.tasks);
        },

        initListeners: () => {
            DOM.addTaskButton.addEventListener('click', App.addTask);
            DOM.addTaskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') App.addTask();
            });
            DOM.taskList.addEventListener('change', (e) => {
                const target = e.target;
                if (target.matches('input[type="checkbox"]')) {
                    const taskId = parseInt(target.dataset.id);
                    App.toggleTaskCompletion(taskId);
                }
            });
            document.querySelector('.tabs').addEventListener('click', (e) => {
                const clickedButton = e.target.closest('.tab');
                if (clickedButton) {
                    const tabName = clickedButton.textContent.trim().includes('Tarefas') ? 'Tarefas' : 'Notas';
                    DOM.switchTab(tabName);
                }
            });
            document.querySelectorAll('.calendario table tbody td:not(:empty)').forEach(cell => {
                cell.addEventListener('click', function() {
                    document.querySelectorAll('.calendario table tbody td').forEach(c => c.classList.remove('selected-day'));
                    this.classList.add('selected-day');
                    console.log(`Dia ${this.textContent} selecionado.`);
                });
            });
        }
    };

    App.init();
});
