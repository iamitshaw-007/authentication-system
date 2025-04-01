CREATE TABLE exam_version_sections(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_version_id UUID NOT NULL,
    section_name VARCHAR(64) NOT NULL CHECK (LENGTH(section_name) > 0),
    CONSTRAINT fk_exam_version_id FOREIGN KEY (exam_version_id) REFERENCES exam_versions(id)
);


CREATE OR REPLACE FUNCTION set_default_exam_section()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.section_name IS NULL THEN
        NEW.section_name = 'defaultExamSection';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER default_exam_section_trigger
BEFORE INSERT ON exam_version_sections
FOR EACH ROW
EXECUTE FUNCTION set_default_exam_section();

INSERT INTO exam_version_sections (exam_version_id, section_name) 
VALUES ('b408f72f-439c-4a43-be21-94abbd35a3ad', 'Group A: Mathematics'), 
('b408f72f-439c-4a43-be21-94abbd35a3ad', 'Group B: English'),
('b408f72f-439c-4a43-be21-94abbd35a3ad', 'Group C: Hindi');