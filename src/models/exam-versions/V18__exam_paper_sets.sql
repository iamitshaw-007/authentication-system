CREATE TABLE exam_paper_sets(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_version_id UUID NOT NULL,
    paper_set_id UUID NOT NULL,
    FOREIGN KEY (exam_version_id) REFERENCES exam_versions(id),
    FOREIGN KEY (paper_set_id) REFERENCES paper_sets(id),
    UNIQUE (exam_version_id, paper_set_id)
);

CREATE OR REPLACE FUNCTION set_default_paper_set()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.paper_set_id IS NULL THEN
        NEW.paper_set_id = (
            SELECT id 
            FROM paper_sets 
            WHERE name = 'A'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER default_paper_set_trigger
BEFORE INSERT ON exam_paper_sets
FOR EACH ROW
EXECUTE FUNCTION set_default_paper_set();

INSERT INTO exam_paper_sets (exam_version_id) 
VALUES ('b408f72f-439c-4a43-be21-94abbd35a3ad');
