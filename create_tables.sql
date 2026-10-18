CREATE TABLE Notes (
    id SERIAL PRIMARY KEY,
    question VARCHAR NOT NULL,
    answer TEXT NOT NULL,
    answer_type VARCHAR(20) NOT NULL
        CHECK (answer_type IN(
            'definition', --определение
            'list', --список
            'characteristic' --характеристика
        )),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- таблица связи заметок и тегов
CREATE TABLE Note_Tags (
    note_id INTEGER NOT NULL
        REFERENCES notes(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL
        REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

-- индекс для поиска заметок по тегу
CREATE INDEX note_tags_tag_id_idx
    ON note_tags(tag_id);


-- индекс для фильтрации заметок по типу ответа
CREATE INDEX notes_answer_type_idx
    ON notes(answer_type);