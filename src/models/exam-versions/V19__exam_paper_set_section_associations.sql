CREATE TABLE exam_paper_set_section_associations (
    exam_paper_set_section_id UUID NOT NULL,
    exam_paper_set_id UUID NOT NULL,
    FOREIGN KEY (exam_paper_set_id) REFERENCES exam_paper_sets(id),
    FOREIGN KEY (exam_paper_set_section_id) REFERENCES exam_paper_set_sections(id),
    PRIMARY KEY (exam_paper_set_section_id, exam_paper_set_id)
);

INSERT INTO exam_paper_set_section_associations (exam_paper_set_id, exam_paper_set_section_id)
VALUES ('ae6b1224-eb9a-47a0-bfae-6d46533a8e97', 'aa40a162-df6a-48cd-a174-c9472e431f53'),
('ae6b1224-eb9a-47a0-bfae-6d46533a8e97', '1e8154e0-51bb-4f85-89b1-11585a9dc7d0');