CREATE TABLE instructor_courses(
    instructor_id UUID NOT NULL,
    course_id UUID NOT NULL,
    CONSTRAINT fk_instructor_id FOREIGN KEY (instructor_id) REFERENCES instructors(id),
    CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES courses(id),
    PRIMARY KEY (instructor_id, course_id)
);