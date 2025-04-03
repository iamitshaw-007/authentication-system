CREATE TABLE exam_paper_set_section_questions (
    exam_version_section_question_id UUID NOT NULL,
    exam_paper_set_section_id UUID NOT NULL,
    question_order INTEGER CHECK (question_order > 0),
    CONSTRAINT fk_exam_paper_set_section_id FOREIGN KEY (exam_paper_set_section_id) REFERENCES exam_paper_set_sections(id),
    CONSTRAINT fk_exam_version_section_question_id FOREIGN KEY (exam_version_section_question_id) REFERENCES exam_version_section_questions(id),
    PRIMARY KEY (exam_paper_set_section_id, exam_version_section_question_id)
);

-- Function to enforce the constraint during insertion
-- Constraint: exam_paper_set_section ~ exam_version_section
CREATE OR REPLACE FUNCTION check_exam_paper_set_section_match()
RETURNS TRIGGER AS $$
DECLARE
    exam_version_section_id_from_exam_paper_set UUID;
    exam_version_section_id_from_exam_version_section_question UUID;
BEGIN
    -- Get exam_version_section_id from exam_paper_set_sections
    SELECT exam_version_section_id INTO exam_version_section_id_from_exam_paper_set
    FROM exam_paper_set_sections
    WHERE id = NEW.exam_paper_set_section_id;

    -- Get exam_version_section_id from exam_version_section_questions
    SELECT exam_version_section_id INTO exam_version_section_id_from_exam_version_section_question
    FROM exam_version_section_questions
    WHERE id = NEW.exam_version_section_question_id;

    -- Check if the exam_version_section_ids match
    IF exam_version_section_id_from_exam_paper_set != exam_version_section_id_from_exam_version_section_question THEN
        RAISE EXCEPTION 'Ensure the compatibility of question and section.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER exam_paper_set_section_match_trigger
BEFORE INSERT ON exam_paper_set_section_questions
FOR EACH ROW
EXECUTE FUNCTION check_exam_paper_set_section_match();

INSERT INTO exam_paper_set_section_questions(exam_paper_set_section_id, exam_version_section_question_id, question_order)
VALUES ('76326f69-ca7a-4a4e-8786-a3dc74649e22', 'e57978bb-c4ce-4ca9-88da-2dd9b6d1cb4a', 2),
('272c0173-2c95-480c-addc-78bb84bab091', 'c3a6cc70-d568-468a-af84-70ad0a7ae264', 2),
('091104ab-8d04-40a6-8185-c5814d5e272a', '17e2960d-5f24-4fe5-aeb8-cba0adc6dd72', 2);