CREATE TABLE exam_paper_sets(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    exam_version_id UUID NOT NULL,
    paper_set_id UUID NOT NULL,
    FOREIGN KEY (exam_version_id) REFERENCES exam_versions(id),
    FOREIGN KEY (paper_set_id) REFERENCES paper_sets(id)
    UNIQUE (exam_version_id, paper_set_id)
);
