document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       LOCAL STORAGE - Salva e carrega tarefas
    ============================================================ */
    const Storage = {
        KEY: 'checklistTasks',

        load: () => {
            const storedTasks = localStorage.getItem(Storage.KEY);
            if (storedTasks) return JSON.parse(storedTasks);
            return [
                { id: 1, text: 'Reunião com a equipe', completed: false },
                { id: 2, text: 'Revisar documentação do projeto', completed: false },
                { id: 3, text: 'Preparar slides da apresentação', completed: false }
            ];
        },

        save: (tasks) => {
            localStorage.setItem(Storage.KEY, JSON.stringify(tasks));
        }
    };

    /* =========================================================
       DOM - Elementos principais
    ============================================================ */
    const DOM = {
        taskList: document.querySelector('.lista-tarefas'),
        statusText: document.querySelector('.status'),
        addTaskInput: document.querySelector('.add-tarefa input[type="text"]'),
        addTaskButton: document.querySelector('.add-tarefa .add-btn'),
        calendarioSection: document.querySelector('.calendario'),

        // Calendário
        calendarBody: document.querySelector('#calendar'),
        monthYearLabel: document.querySelector('#MesAno'),
        prevBtn: document.querySelector('#AntMes'),
        nextBtn: document.querySelector('#ProxMes'),

        createTaskElement: (task) => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('tarefa');
            if (task.completed) taskDiv.classList.add('concluida');
            taskDiv.dataset.taskId = task.id;

            taskDiv.innerHTML = `
                <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                <label for="task-${task.id}">${task.text}</label>
            `;
            return taskDiv;
        },

        renderTasks: (tasks) => {
            DOM.taskList.innerHTML = '';
            tasks.forEach(task => {
                DOM.taskList.appendChild(DOM.createTaskElement(task));
            });
            DOM.updateTaskStatus(tasks);
        },

        updateTaskStatus: (tasks) => {
            const total = tasks.length;
            const done = tasks.filter(t => t.completed).length;
            DOM.statusText.textContent = `${done} de ${total} Concluídas`;
        }
    };

    /* =========================================================
       APP PRINCIPAL
    ============================================================ */
    const App = {
        tasks: [],
        currentDate: new Date(),

        init: () => {
            App.tasks = Storage.load();
            DOM.renderTasks(App.tasks);
            App.renderCalendar();
            App.initListeners();
        },

        addTask: () => {
            const text = DOM.addTaskInput.value.trim();
            if (text === '') return;

            const newId = App.tasks.length > 0 ? Math.max(...App.tasks.map(t => t.id)) + 1 : 1;
            const newTask = { id: newId, text, completed: false };

            App.tasks.push(newTask);
            Storage.save(App.tasks);
            DOM.addTaskInput.value = '';
            DOM.renderTasks(App.tasks);
        },

        toggleTaskCompletion: (taskId) => {
            const index = App.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                App.tasks[index].completed = !App.tasks[index].completed;
                Storage.save(App.tasks);
                DOM.renderTasks(App.tasks);
            }
        },

        /* ======================== CALENDÁRIO ========================== */
        renderCalendar: () => {
            const month = App.currentDate.getMonth();
            const year = App.currentDate.getFullYear();

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);

            const startDay = firstDay.getDay(); // 0 = domingo
            const totalDays = lastDay.getDate();

            // Atualiza título
            const meses = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ];
            DOM.monthYearLabel.textContent = `${meses[month]} ${year}`;

            // Remove linhas anteriores
            const oldTbody = DOM.calendarBody.querySelector('tbody');
            if (oldTbody) oldTbody.remove();

            // Cria novo corpo da tabela
            const tbody = document.createElement('tbody');
            let row = document.createElement('tr');

            // Dias vazios antes do início do mês
            for (let i = 0; i < startDay; i++) {
                const empty = document.createElement('td');
                empty.classList.add('inactive');
                row.appendChild(empty);
            }

            // Dias do mês
            for (let day = 1; day <= totalDays; day++) {
                if (row.children.length === 7) {
                    tbody.appendChild(row);
                    row = document.createElement('tr');
                }

                const cell = document.createElement('td');
                cell.textContent = day;

                const today = new Date();
                if (
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear()
                ) {
                    cell.classList.add('today');
                }

                cell.addEventListener('click', () => {
                    tbody.querySelectorAll('td').forEach(td => td.classList.remove('active'));
                    cell.classList.add('active');
                    console.log(`Dia ${day}/${month + 1}/${year} selecionado.`);
                });

                row.appendChild(cell);
            }

            // Preenche os espaços vazios no final do mês
            while (row.children.length < 7) {
                const empty = document.createElement('td');
                empty.classList.add('inactive');
                row.appendChild(empty);
            }
            tbody.appendChild(row);

            DOM.calendarBody.appendChild(tbody);
        },

        changeMonth: (offset) => {
            App.currentDate.setMonth(App.currentDate.getMonth() + offset);
            App.renderCalendar();
        },

        /* ======================== EVENTOS ========================== */
        initListeners: () => {
            DOM.addTaskButton.addEventListener('click', App.addTask);
            DOM.addTaskInput.addEventListener('keypress', e => {
                if (e.key === 'Enter') App.addTask();
            });

            DOM.taskList.addEventListener('change', e => {
                if (e.target.matches('input[type="checkbox"]')) {
                    const id = parseInt(e.target.dataset.id);
                    App.toggleTaskCompletion(id);
                }
            });

            if (DOM.prevBtn && DOM.nextBtn) {
                DOM.prevBtn.addEventListener('click', () => App.changeMonth(-1));
                DOM.nextBtn.addEventListener('click', () => App.changeMonth(1));
            }
        }
    };

    App.init();
});
