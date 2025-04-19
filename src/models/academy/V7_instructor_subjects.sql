CREATE TABLE instructor_subjects(
    instructor_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    CONSTRAINT fk_instructor_id FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    CONSTRAINT fk_subject_id FOREIGN KEY (subject_id) REFERENCES subjects(id),
    PRIMARY KEY (instructor_id, subject_id)
);