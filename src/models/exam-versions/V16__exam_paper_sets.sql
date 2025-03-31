CREATE TABLE exam_paper_sets(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_version_id UUID NOT NULL,
    paper_set_id UUID NOT NULL,
    FOREIGN KEY (exam_version_id) REFERENCES exam_versions(id),
    FOREIGN KEY (paper_set_id) REFERENCES paper_sets(id),
    UNIQUE (exam_version_id, paper_set_id)
);

INSERT INTO exam_paper_sets (exam_version_id, paper_set_id) 
VALUES ('cccafc7d-75c6-4c0f-87de-3be9c5929439', 'afb86bb4-6b8c-45d7-8e77-2b0a1155cb1e');
