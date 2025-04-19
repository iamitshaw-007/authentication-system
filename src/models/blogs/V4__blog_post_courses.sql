CREATE TABLE blog_post_courses(
    blog_post_id UUID NOT NULL,
    course_id UUID NOT NULL, 
    subject_id UUID NOT NULL,
    CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_subject_id FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_blog_post_id FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id)
);

INSERT INTO blog_post_courses (
    blog_post_id,
    course_id,
    subject_id
)
VALUES (
    (SELECT id FROM blog_posts WHERE display_id = '1'),
    (SELECT id FROM courses WHERE course_code = '01'),
    (SELECT id FROM subjects WHERE subject_code = 'ENGLISH_01')
),
(
    (SELECT id FROM blog_posts WHERE display_id = '1'),
    (SELECT id FROM courses WHERE course_code = '01'),
    (SELECT id FROM subjects WHERE subject_code = 'HINDI_01')
),
(
    (SELECT id FROM blog_posts WHERE display_id = '2'),
    (SELECT id FROM courses WHERE course_code = '02'),
    (SELECT id FROM subjects WHERE subject_code = 'ENGLISH_02')
),
(
    (SELECT id FROM blog_posts WHERE display_id = '2'),
    (SELECT id FROM courses WHERE course_code = '02'),
    (SELECT id FROM subjects WHERE subject_code = 'HINDI_02')
);