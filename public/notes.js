
const notesContainer = document.querySelector(".navbar__scroll-questions");

const addNoteButton = document.querySelector(".settings-icon");

const questionInput = document.querySelector(".editor__question-input");
const answerInput = document.querySelector(".editor__answer-input");
const tagsInput = document.querySelector(".editor__tags-input");
const answerTypeInputs = document.querySelectorAll(
    ".editor__tags-type_answer-input"
);

let activeNoteElement = null;

// Загружаем заметки из JSON-файла
async function loadNotes() {
    try {
        const response = await fetch("./notes.json");
        const notes = await response.json();
        renderNotes(notes);
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

    // Обработка нажатия на заметку
    noteElement.addEventListener("click", () => {
        
        // Отключаем если уже нажали по другой заметке
        if (activeNoteElement !== null) {
            activeNoteElement.classList.remove("navbar__tags-note_active");
        }
        // Делаем новую заметку активной
        noteElement.classList.add("navbar__tags-note_active");
        // Запоминаем активную заметку
        activeNoteElement = noteElement;
        // Заполняем редактор
        fillEditor(note);
    });

    // Дата
    const timeElement = document.createElement("div");
    timeElement.className = "navbar__tags-note-timeago";

    
    const days = getDaysAgo(note.created_at);

    const timeNum = document.createElement("div");
    timeNum.className = "navbar__tags-note-timeago-num";
    timeElement.append(timeNum);

    const timeUnit = document.createElement("div");
    timeUnit.className = "navbar__tags-note-timeago-unit";

    if (days === 0) {
        timeNum.textContent = "Сегодня";
    } else if (days === 1) {
        timeNum.textContent = "Вчера";
    } else {
        timeNum.textContent = days;
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
function renderNotes(notes) {
    notesContainer.replaceChildren();

    activeNoteElement = null;

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
            const noteElement = createNoteElement(note);
            tagElement.append(noteElement);
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
}

addNoteButton.addEventListener("click", () => {
    if (activeNoteElement !== null) { 
        activeNoteElement.classList.remove("navbar__tags-note_active");
    }

    activeNoteElement = null;

    clearEditor();
});

loadNotes();