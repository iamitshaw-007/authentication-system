CREATE TABLE section_question_associations (
    question_id UUID NOT NULL,
    question_section_id UUID NOT NULL,
    question_order INTEGER CHECK (question_order > 0),
    marks INTEGER NOT NULL CHECK (marks > 0),
    FOREIGN KEY (question_section_id) REFERENCES question_sections(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    PRIMARY KEY (question_section_id, question_id)
);