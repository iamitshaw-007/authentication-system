CREATE TABLE session_exams(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL,
    exam_version_id UUID NOT NULL,
    session_id UUID NOT NULL,
    CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_exam_version_id FOREIGN KEY (exam_version_id) REFERENCES exam_versions(id),
    CONSTRAINT fk_session_id FOREIGN KEY (session_id) REFERENCES sessions(id)
);