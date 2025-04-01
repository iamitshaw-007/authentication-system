CREATE TABLE exam_paper_set_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_order INTEGER CHECK (section_order > 0),
    exam_version_section_id UUID NOT NULL,
    exam_paper_set_id UUID NOT NULL,
    CONSTRAINT fk_exam_paper_set_id FOREIGN KEY (exam_paper_set_id) REFERENCES exam_paper_sets(id),
    CONSTRAINT fk_exam_version_section_id FOREIGN KEY (exam_version_section_id) REFERENCES exam_version_sections(id),
    UNIQUE (exam_version_section_id, exam_paper_set_id)
);

INSERT INTO exam_paper_set_sections (exam_version_section_id, section_order, exam_paper_set_id) 
VALUES ('c73dea20-ede8-4eaa-95c2-ab170884d250', 3, '0ed34dd8-c1cb-401d-9b82-25522633dfa1'),
('dfc12a0e-b80c-43c5-83b7-2f1b3ac28e75', 2, '0ed34dd8-c1cb-401d-9b82-25522633dfa1'),
('f39dce68-66d1-47d7-9532-0d4cb1ae928c', 1, '0ed34dd8-c1cb-401d-9b82-25522633dfa1');