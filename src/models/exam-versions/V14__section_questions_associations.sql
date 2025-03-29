CREATE TABLE section_questions_associations (
    question_section_id UUID NOT NULL,
    question_id UUID NOT NULL,
    question_order INTEGER CHECK (question_order > 0),
    marks INTEGER NOT NULL CHECK (marks > 0),
    FOREIGN KEY (question_section_id) REFERENCES question_sections(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    PRIMARY KEY (question_section_id, question_id)
);

INSERT INTO section_questions_associations(
    question_section_id, 
    question_id, 
    question_order, 
    marks
)
VALUES (
    (SELECT id from question_sections WHERE name = 'Group I: Mathematics'),
    '103dcad8-d9a6-4e74-94a3-c4991423ffef',
    1,
    2
), (
    (SELECT id from question_sections WHERE name = 'Group II: Science'),
    '29114aaa-64db-4d02-8567-cab9361d9b6c',
    1,
    2
), (
    (SELECT id from question_sections WHERE name = 'Group II: Science'),
    '9a69547c-877e-40fd-8af3-b9f10bc97438',
    2,
    1
), (
    (SELECT id from question_sections WHERE name = 'Group II: Science'),
    'df176856-0d01-4106-8464-ab4edf85bac0',
    3,
    2
), (
    (SELECT id from question_sections WHERE name = 'Group I: Mathematics'),
    '8b5fa2a6-d6d3-43c6-ab4f-670bc2560ace',
    2,
    1
);