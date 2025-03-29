CREATE TABLE question_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_name VARCHAR(64) NOT NULL CHECK (LENGTH(section_name) > 0),
    section_order INTEGER CHECK (section_order > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
);

CREATE TABLE paper_set_section_association (
    question_section_id UUID NOT NULL,
    exam_paper_set_id UUID NOT NULL,
    FOREIGN KEY (exam_paper_set_id) REFERENCES exam_paper_sets(id),
    FOREIGN KEY (question_section_id) REFERENCES question_sections(id)
    PRIMARY KEY (question_section_id, exam_paper_set_id)
);

CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON question_sections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO question_sections (question_paper_set_id, name, section_order) 
VALUES (
    (SELECT id from question_paper_sets WHERE name = 'A'),
    'Group I: Mathematics',
    1
), (
    (SELECT id from question_paper_sets WHERE name = 'A'),
    'Group II: Science',
    2
);