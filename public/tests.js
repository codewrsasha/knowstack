const testsContainer = document.querySelector(".navbar__scroll-tests");
const testSection = document.querySelector(".test");

let notes = [];
let selectedTag = null;
let currentQuestion = null;
let solvedCount = 0;
let correctCount = 0;
let answered = false;

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

function getRandomQuestion() {
    // Получаем все заметки по выбранному тегу
    const tagNotes = notes.filter((note) => {
        return note.tags.includes(selectedTag);
    });

    if (tagNotes.length === 0) {
        return null;
    }

    // Выбираем случайную заметку
    const randomIndex = Math.floor(Math.random() * tagNotes.length);
    return tagNotes[randomIndex];
}

function getRandomAnswers(question) {
    // находим ответы с одинаковыми типами 
    const wrongAnswers = notes.filter((note) => {
        return (
            note.id !== question.id &&
            note.answer_type === question.answer_type &&
            note.answer.trim() !== "" &&
            note.answer !== question.answer
        );
    });
    if (wrongAnswers.length < 2) {
        return null;
    }

    // Случайно выбираем два неправильных ответа
    const randomWrongAnswers = wrongAnswers
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

    // Добавляем правильный ответ
    const answers = [{
            text: question.answer,
            isCorrect: true
        },
        ...randomWrongAnswers.map((note) => ({
            text: note.answer,
            isCorrect: false
        }))
    ];

    // Перемешиваем все три варианта
    answers.sort(() => Math.random() - 0.5);
    return answers;
}

function showNextQuestion() {
    testSection.replaceChildren();

    answered = false;

    currentQuestion = getRandomQuestion();

    if (!currentQuestion) {
        testSection.textContent = "Вопросы не найдены.";
        return;
    }

    const answers = getRandomAnswers(currentQuestion);

    if (answers) {
        renderActiveTest(currentQuestion, answers);
    } else {
        testSection.textContent =
            "Недостаточно заметок для формирования вариантов ответа.";
    }
}

function finishTest() {
    testSection.replaceChildren();

    const resultTitle = document.createElement("h2");
    resultTitle.textContent = `Результаты теста: ${selectedTag}`;

    const solvedText = document.createElement("p");
    solvedText.textContent = `Решено вопросов: ${solvedCount}`;

    const correctText = document.createElement("p");
    correctText.textContent = `Правильных ответов: ${correctCount}`;

    const wrongText = document.createElement("p");
    wrongText.textContent = `Неправильных ответов: ${solvedCount - correctCount}`;

    testSection.append(
        resultTitle,
        solvedText,
        correctText,
        wrongText
    );
}

// Открытие выбранного теста по нажатию
function openTest(tag, testElement) {
    selectedTag = tag;
    solvedCount = 0;
    correctCount = 0;
    answered = false;

    // Убираем выделение со всех тестов
    const testElements = testsContainer.querySelectorAll(".navbar__tags-test");
    testElements.forEach((element) => {
        element.classList.remove("navbar__tags-test_active");
    });

    // Выделяем выбранный тест
    testElement.classList.add("navbar__tags-test_active");

    showNextQuestion();

    console.log("Выбран тест:", selectedTag);
}

// Отрисовываем HTML теста
function renderActiveTest(question, answers) {
    // Блок с вопросом
    const questionBlock = document.createElement("div");
    questionBlock.className = "test__question";

    const questionTitle = document.createElement("h2");
    questionTitle.textContent = question.question;
    questionBlock.append(questionTitle);

    // Блок с вариантами ответов
    const answersBlock = document.createElement("div");
    answersBlock.className = "test__answers";

    // Создаём три кнопки ответов
    for (let i = 1; i <= 3; i++) {
        const answerButton = document.createElement("button");
        answerButton.className = `test__answer${i}`;

        answerButton.textContent = answers[i - 1].text;
        // информация о правильном ответе
        answerButton.dataset.correct = answers[i - 1].isCorrect;

        answerButton.addEventListener("click", () => {
            checkAnswer(answersBlock, answerButton);
        });

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

    nextButton.addEventListener("click", () => {
        showNextQuestion();
    });

    finishButton.addEventListener("click", () => {
        finishTest();
    });

    controlsBlock.append(nextButton, finishButton);

    // Добавляем все блоки в секцию теста
    testSection.append(
        questionBlock,
        answersBlock,
        controlsBlock
    );
}

function checkAnswer(answersBlock, selectedButton) {
    // Если на этот вопрос уже ответили, ничего не делаем
    if (answered) {
        return;
    }

    answered = true;
    solvedCount++;

    // Проверяем, был ли выбран правильный ответ
    if (selectedButton.dataset.correct === "true") {
        correctCount++;
    }

    const answerButtons = answersBlock.querySelectorAll("button");

    answerButtons.forEach((button) => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        } else {
            button.classList.add("wrong");
        }

        button.disabled = true;
    });
}

loadNotes();
