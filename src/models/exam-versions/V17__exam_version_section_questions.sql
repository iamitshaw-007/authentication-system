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
VALUES('c73dea20-ede8-4eaa-95c2-ab170884d250', 'f1ae5a89-4836-47f2-a433-70adc2052511', 2),
('dfc12a0e-b80c-43c5-83b7-2f1b3ac28e75', 'a793969c-a5e5-4b54-8d96-b19b3dac2f07', 2),
('f39dce68-66d1-47d7-9532-0d4cb1ae928c', 'a75a9603-b2a1-416a-a521-6cec70b037b0', 2);