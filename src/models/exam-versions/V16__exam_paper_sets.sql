CREATE TABLE exam_paper_sets(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_version_id UUID NOT NULL,
    paper_set_id UUID NOT NULL,
    FOREIGN KEY (exam_version_id) REFERENCES exam_versions(id),
    FOREIGN KEY (paper_set_id) REFERENCES paper_sets(id)
    UNIQUE (exam_version_id, paper_set_id)
);

-- CREATE TABLE exam_version_sections_associations (
--     exam_version_id UUID NOT NULL,
--     question_section_id UUID NOT NULL,
--     FOREIGN KEY (exam_version_id) REFERENCES exam_versions(id),
--     FOREIGN KEY (question_section_id) REFERENCES question_sections(id),
--     PRIMARY KEY (exam_version_id, question_section_id)
-- );

-- INSERT INTO exam_version_sections_associations(exam_version_id, question_section_id)
-- VALUES ('b2616e57-3a5c-47e7-969e-ca59d3ca9ff6', 'c9203eff-dec3-44a6-bb81-b7e02319c019'),
-- ('b2616e57-3a5c-47e7-969e-ca59d3ca9ff6', '36b3d7c5-bc4e-4fce-9690-4b5bb1cb166c');