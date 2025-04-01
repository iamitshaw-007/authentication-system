CREATE TABLE exam_version_section_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL,
    exam_version_section_id UUID NOT NULL,
    marks INTEGER NOT NULL CHECK (marks > 0),
    CONSTRAINT fk_exam_version_section_id FOREIGN KEY (exam_version_section_id) REFERENCES exam_version_sections(id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    UNIQUE(exam_version_section_id, question_id)
);

INSERT INTO exam_version_section_questions(exam_version_section_id, question_id, marks)
VALUES('c73dea20-ede8-4eaa-95c2-ab170884d250', 'ac580240-e87b-47cf-854d-1c01848a63a5', 3),
('dfc12a0e-b80c-43c5-83b7-2f1b3ac28e75', 'b5235a8c-a29f-4a79-9a4b-63311cdab878', 2),
('f39dce68-66d1-47d7-9532-0d4cb1ae928c', 'c4bc8755-010b-42f1-a6b6-7d74d0337f06', 1);