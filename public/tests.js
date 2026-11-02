const testsContainer = document.querySelector(".navbar__scroll-tests");
const testSection = document.querySelector(".test");

let notes = [];
let selectedTag = null;
let currentQuestion = null;

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

    // Проверка нажатия на тест и открытия теста
    testElement.addEventListener("click", () => {
        openTest(tag, testElement);
    });

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

// Открытие выбранного теста по нажатию
function openTest(tag, testElement) {
    selectedTag = tag;

    // Убираем выделение со всех тестов
    const testElements = testsContainer.querySelectorAll(".navbar__tags-test");
    testElements.forEach((element) => {
        element.classList.remove("navbar__tags-test_active");
    });

    // Выделяем выбранный тест
    testElement.classList.add("navbar__tags-test_active");

    // Очищаем область теста
    testSection.replaceChildren();

    renderActiveTest();

    console.log("Выбран тест:", selectedTag);
}

// Отрисовываем HTML теста
function renderActiveTest() {
    // Блок с вопросом
    const questionBlock = document.createElement("div");
    questionBlock.className = "test__question";

    const questionTitle = document.createElement("h2");
    questionTitle.textContent = "Здесь появится вопрос";

    questionBlock.append(questionTitle);

    // Блок с вариантами ответов
    const answersBlock = document.createElement("div");
    answersBlock.className = "test__answers";

    // Создаём три кнопки ответов
    for (let i = 1; i <= 3; i++) {
        const answerButton = document.createElement("button");
        answerButton.className = `test__answer${i}`;
        answerButton.textContent = `Вариант ответа ${i}`;

        answersBlock.append(answerButton);
    }

    // Блок с кнопками управления
    const controlsBlock = document.createElement("div");
    controlsBlock.className = "test__controls";

    const nextButton = document.createElement("button");
    nextButton.className = "test__next";
    nextButton.textContent = "Следующий вопрос";

    const finishButton = document.createElement("button");
    finishButton.className = "test__finish";
    finishButton.textContent = "Завершить тест";

    controlsBlock.append(nextButton, finishButton);

    // Добавляем все блоки в секцию теста
    testSection.append(
        questionBlock,
        answersBlock,
        controlsBlock
    );
}


loadNotes();
