CREATE TABLE session_exam_registrations(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    session_id UUID NOT NULL,
    session_exam_id UUID NOT NULL,
    session_exam_paper_set_id UUID NOT NULL,
    has_exam_attended VARCHAR(4) DEFAULT('NO') CHECK(has_exam_attended IN ('YES', 'NO')),
    session_exam_status VARCHAR(16) DEFAULT('REGISTERED') CHECK(session_exam_status IN ('REGISTERED', 'IN_PROGRESS', 'COMPLETED', 'VOIDED')),
    marks_obtained INTEGER NOT NULL CHECK (
        (has_exam_attended = 'YES' AND marks_obtained IS NOT NULL)
        OR (has_exam_attended = 'NO' AND marks_obtained IS NULL)
    ),
    exam_completion_time time NOT NULL CHECK (
        (has_exam_attended = 'YES' AND exam_completion_time IS NOT NULL)
        OR (has_exam_attended = 'NO' AND exam_completion_time IS NULL)
    ),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    -- CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES academy_admins(id),
    -- CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES academy_admins(id),
    CONSTRAINT fk_student_id FOREIGN KEY (student_id) REFERENCES students(id),
    CONSTRAINT fk_session_id FOREIGN KEY (session_id) REFERENCES sessions(id),
    CONSTRAINT fk_session_exam_id FOREIGN KEY (session_exam_id) REFERENCES session_exams(id),
    CONSTRAINT fk_session_exam_paper_set_id FOREIGN KEY (session_exam_paper_set_id) REFERENCES session_exam_paper_sets(id)
);