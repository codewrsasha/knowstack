
const testsContainer = document.querySelector(".navbar__scroll-tests");

let notes = [];

// Загружаем заметки из JSON-файла
async function loadNotes() {
    try {
        const response = await fetch("./notes.json");
        notes = await response.json(); 
        renderTests();
    } catch (error) {
        console.error("Ошибка загрузки заметок:", error);
    }
}

// Создаём карточку одного теста
function createTestElement(tag, tagNotes) {
    const testElement = document.createElement("div");
    testElement.className = "navbar__tags-test";

    // Иконка
    const icon = document.createElement("span");
    icon.className = "navbar__tags-test-icon";
    icon.textContent = tag[0].toUpperCase();

    // Информация о тесте
    const info = document.createElement("div");
    info.className = "navbar__tags-test-info";

    const title = document.createElement("h3");
    title.textContent = tag;

    const questionsCount = document.createElement("p");
    questionsCount.textContent = `${tagNotes.length} вопросов`;

    info.append(title, questionsCount);

    testElement.append(icon, info);

    return testElement;
}


function renderTests() {
    testsContainer.replaceChildren();

    // Получаем массив ключ(тег) значение(тест)
    const testsByTag = new Map();

    notes.forEach((note) => {
        note.tags.forEach((tag) => {
            if (!testsByTag.has(tag)) {
                testsByTag.set(tag, []);
            }
            testsByTag.get(tag).push(note);
        });
    });

    // Создаём группу тестов
    const recentTests = document.createElement("div");
    recentTests.className = "navbar__tags";

    // Отбираем теги по которым более 3х записей, иначе тест не формируется
    const availableTests = [];

    testsByTag.forEach((tagNotes, tag) => {
        if (tagNotes.length > 3) {
            availableTests.push({ tag, tagNotes });
        }
    });

    // Если условия формирования тестов не выполняются, даём знать об этом пользователю
    if (availableTests.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "navbar__tags-date";
        emptyMessage.textContent = "Тестов пока нет, ваша база знаний мала(";

        recentTests.append(emptyMessage);
    } else {
        // Заголовок группы
        const title = document.createElement("div");
        title.className = "navbar__tags-date";
        title.textContent = "Недавно";

        recentTests.append(title);

        // Создаём элементы тестов
        availableTests.forEach(({ tag, tagNotes }) => {
            recentTests.append(createTestElement(tag, tagNotes));
        });
    }

    testsContainer.append(recentTests);
}


loadNotes();
