
CREATE TABLE paper_set_section_associations (
    question_section_id UUID NOT NULL,
    exam_paper_set_id UUID NOT NULL,
    FOREIGN KEY (exam_paper_set_id) REFERENCES exam_paper_sets(id),
    FOREIGN KEY (question_section_id) REFERENCES question_sections(id)
    PRIMARY KEY (question_section_id, exam_paper_set_id)
);