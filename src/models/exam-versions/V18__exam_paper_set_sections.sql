CREATE TABLE exam_paper_set_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_order INTEGER CHECK (section_order > 0),
    exam_version_section_id UUID NOT NULL,
    CONSTRAINT fk_exam_version_section_id FOREIGN KEY (exam_version_section_id) REFERENCES exam_version_sections(id)
);

INSERT INTO question_sections (section_order, exam_version_section_id) 
VALUES ('Group-I: Biology', 1),
('Group-2: Chemistry', 2);