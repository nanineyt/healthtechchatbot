CREATE TABLE tb_doc_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_doc TEXT NOT NULL,
    dayOfWeek TEXT,
    startTime TEXT,
    endTime TEXT
);
CREATE TABLE tb_booking (
     id_user INTEGER NOT NULL,
    name_doc TEXT,
    date DATETIME,
    startTime TEXT,
    endTime TEXT
);

CREATE TABLE tb_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lineid TEXT NOT NULL,
    username TEXT NOT NULL,
    messages JSON
);