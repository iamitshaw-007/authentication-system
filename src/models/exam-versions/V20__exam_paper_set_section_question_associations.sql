CREATE TABLE exam_paper_set_section_question_associations (
    exam_version_section_question_id UUID NOT NULL,
    exam_paper_set_section_id UUID NOT NULL,
    question_order INTEGER CHECK (question_order > 0),
    FOREIGN KEY (exam_paper_set_section_id) REFERENCES exam_paper_set_sections(id),
    FOREIGN KEY (exam_version_section_question_id) REFERENCES exam_version_section_questions(id),
    PRIMARY KEY (exam_paper_set_section_id, exam_version_section_question_id)
);

INSERT INTO exam_paper_set_section_question_associations(exam_paper_set_section_id, exam_version_section_question_id, question_order)
VALUES ('aa40a162-df6a-48cd-a174-c9472e431f53', 'ddff70e2-17bc-45f6-a542-775eb4fa47ba', 1),
('aa40a162-df6a-48cd-a174-c9472e431f53', '82e5f110-7b35-42ae-b0e1-83148fcf5ef8', 2),
('1e8154e0-51bb-4f85-89b1-11585a9dc7d0', '143ef772-4354-496f-93e3-482ac66d0278', 1);
