
const notesContainer = document.querySelector(".navbar__scroll-questions");

const addNoteButton = document.querySelector(".settings-icon");

const questionInput = document.querySelector(".editor__question-input");
const answerInput = document.querySelector(".editor__answer-input");
const tagsInput = document.querySelector(".editor__tags-input");
const answerTypeInputs = document.querySelectorAll(".editor__tags-type_answer-input");

const saveButton = document.querySelector(".editor__save-button");
const deleteButton = document.querySelector(".editor__delete-button");

let notes = [];

let activeNoteId = null;

// Загружаем заметки из JSON-файла
async function loadNotes() {
    try {
        const response = await fetch("./notes.json");
        notes = await response.json();
        renderNotes();
    } catch (error) {
        console.log("Ошибка загрузки заметок");
    }
}

// Разница между датой заметки и сегодняшним днём
function getDaysAgo(dateString) {
    return Math.floor((Date.now() - Date.parse(dateString)) / 86400000);
}

function formatDate(dateString) {
    const days = getDaysAgo(dateString);
    if (days === 0) {
        return "Сегодня";
    }
    if (days === 1) {
        return "Вчера";
    }
    return `${days}`;
}

function getDayWord(number) {
    const lastTwo = number % 100;
    const last = number % 10;

    if (lastTwo >= 11 && lastTwo <= 14) {
        return "дней";
    }
    if (last === 1) {
        return "день";
    }
    if (last >= 2 && last <= 4) {
        return "дня";
    }
    return "дней";
}

// Создаём карточку одной заметки
function createNoteElement(note) {
    const noteElement = document.createElement("div");
    noteElement.className = "navbar__tags-note";

    if (note.id === activeNoteId) {
        noteElement.classList.add("navbar__tags-note_active");
    }

    // Обработка нажатия на заметку
    noteElement.addEventListener("click", () => {
        fillEditor(note);
        renderNotes();
    });

    // Дата
    const timeElement = document.createElement("div");
    timeElement.className = "navbar__tags-note-timeago";

    const timeNum = document.createElement("div");
    timeNum.className = "navbar__tags-note-timeago-num";
    timeNum.textContent = formatDate(note.created_at);
    timeElement.append(timeNum);

    const days = getDaysAgo(note.created_at);

    if (days > 1) {
        const timeUnit = document.createElement("div");
        timeUnit.className = "navbar__tags-note-timeago-unit";
        timeUnit.textContent = getDayWord(days);

        timeElement.append(timeUnit);
    }

    // Вопрос и краткий ответ
    const description = document.createElement("div");
    description.className = "navbar__tags-note-discription";

    const question = document.createElement("h3");
    question.textContent = note.question;

    const answer = document.createElement("p");
    answer.textContent =
        note.answer.length > 65 ? note.answer.slice(0, 65) + "..." : note.answer;

    description.append(question, answer);
    noteElement.append(timeElement, description);

    return noteElement;
}

// Отображаем теги, по ним группируем и отображаем заметки
function renderNotes() {
    notesContainer.replaceChildren();

    // Получаем массив ключ(тег) значение(заметка)
    const notesByTag = new Map();

    notes.forEach((note) => {
        note.tags.forEach((tag) => {
            if (!notesByTag.has(tag)) {
                notesByTag.set(tag, []);
            }

            notesByTag.get(tag).push(note);
        });
    });

    // Создаём отдельный блок для каждого тега
    notesByTag.forEach((tagNotes, tag) => {
        const tagElement = document.createElement("div");
        tagElement.className = "navbar__tags";

        const title = document.createElement("div");
        title.className = "navbar__tags-title";
        title.textContent = tag;

        tagElement.append(title);

        tagNotes.forEach((note, index) => {
            tagElement.append(createNoteElement(note));
        });

        notesContainer.append(tagElement);
    });
}

// Очистка полей редактора
function clearEditor() {
    questionInput.value = "";
    answerInput.value = "";
    tagsInput.value = "";

    // Снимаем выбор со всех типов ответа
    answerTypeInputs.forEach((input) => {
        input.checked = false;
    });

    activeNoteId = null;
}

// Заполняем редактор данными заметки
function fillEditor(note) {
    questionInput.value = note.question;
    answerInput.value = note.answer;
    tagsInput.value = note.tags.join(", ");

    // Выбираем соответствующий тип ответа
    answerTypeInputs.forEach((input) => {
        input.checked = input.value === note.answer_type;
    });

    activeNoteId = note.id;
}

addNoteButton.addEventListener("click", () => {
    clearEditor();
    renderNotes();
});

saveButton.addEventListener("click", () => {
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    // Разделяем теги
    const tags = tagsInput.value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

    // Записываем выбранный тип ответа
    let answerType = "";

    answerTypeInputs.forEach((input) => {
        if (input.checked) {
            answerType = input.value;
        }
    });

    // Проверяем обязательные поля
    if (!question || !answer || tags.length === 0 || !answerType) {
        alert("Заполни вопрос, ответ, теги и выбери тип ответа.");
        return;
    }

    // Если заметка выбрана — редактируем её
    if (activeNoteId !== null) {
        const note = notes.find((item) => item.id === activeNoteId);

        if (!note) {
            alert("Не удалось найти выбранную заметку.");
            clearEditor();
            renderNotes();
            return;
        }

        note.question = question;
        note.answer = answer;
        note.tags = tags;
        note.answer_type = answerType;
    } else {
        // Если заметка не выбрана — создаём новую
        const newId = notes.length > 0
            ? Math.max(...notes.map((note) => note.id)) + 1 : 1;

        const newNote = {
            id: newId,
            question: question,
            answer: answer,
            answer_type: answerType,
            tags: tags,
            created_at: new Date().toISOString()
        };

        notes.push(newNote);
        activeNoteId = newId;
    }

    // Обновляем список заметок
    renderNotes();

    // Оставляем сохранённую заметку открытой
    const savedNote = notes.find((note) => note.id === activeNoteId);

    if (savedNote) {
        fillEditor(savedNote);
        renderNotes();
    }
});

deleteButton.addEventListener("click", () => {
    if (activeNoteId === null) {
        return;
    }

    if (!confirm("Ты действительно хочешь удалить эту заметку?")) {
        return;
    }

    // Удаляем заметку из массива
    notes = notes.filter((note) => note.id !== activeNoteId);

    clearEditor();
    renderNotes();
});    

clearEditor();
loadNotes();