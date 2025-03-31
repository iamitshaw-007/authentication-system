CREATE TABLE section_question_associations (
    question_id UUID NOT NULL,
    question_section_id UUID NOT NULL,
    question_order INTEGER CHECK (question_order > 0),
    marks INTEGER NOT NULL CHECK (marks > 0),
    FOREIGN KEY (question_section_id) REFERENCES question_sections(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    PRIMARY KEY (question_section_id, question_id)
);

INSERT INTO section_question_associations(question_section_id, question_id, question_order, marks)
VALUES ('aa40a162-df6a-48cd-a174-c9472e431f53', 'ddff70e2-17bc-45f6-a542-775eb4fa47ba', 1, 2),
('aa40a162-df6a-48cd-a174-c9472e431f53', '82e5f110-7b35-42ae-b0e1-83148fcf5ef8', 2, 1),
('1e8154e0-51bb-4f85-89b1-11585a9dc7d0', '143ef772-4354-496f-93e3-482ac66d0278', 1, 4);
