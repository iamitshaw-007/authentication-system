CREATE TABLE question_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_name VARCHAR(64) NOT NULL CHECK (LENGTH(section_name) > 0),
    section_order INTEGER CHECK (section_order > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON question_sections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO question_sections (section_name, section_order) 
VALUES ('Group-I: Biology', 1),
('Group-2: Chemistry', 2);