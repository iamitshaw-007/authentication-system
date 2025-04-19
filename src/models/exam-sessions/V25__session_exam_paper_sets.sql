CREATE TABLE session_exam_paper_set(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_exam_id UUID NOT NULL,
    exam_paper_set_id UUID NOT NULL,
    CONSTRAINT fk_session_exam_id FOREIGN KEY (session_exam_id) REFERENCES session_exams(id),
    CONSTRAINT fk_exam_paper_set_id FOREIGN KEY (exam_paper_set_id) REFERENCES exam_paper_sets(id),
    UNIQUE(session_exam_id, exam_paper_set_id)
);