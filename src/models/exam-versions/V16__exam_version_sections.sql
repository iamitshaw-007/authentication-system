CREATE TABLE exam_version_sections(
    id UUID PRIMARY KEY uuid_generate_v4(),
    exam_version_id UUID NOT NULL,
    section_name VARCHAR(64) NOT NULL CHECK (LENGTH(section_name) > 0),
    CONSTRAINT fk_exam_version_id FOREIGN KEY (exam_version_id) REFERENCES exam_versions(id)
);

CREATE TABLE exam_version_section_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL,
    exam_version_section_id UUID NOT NULL,
    marks INTEGER NOT NULL CHECK (marks > 0),
    CONSTRAINT fk_exam_version_section_id FOREIGN KEY (exam_version_section_id) REFERENCES exam_version_sections(id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    UNIQUE(exam_version_section_id, question_id)
);