CREATE TABLE subjects(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    subject_code VARCHAR(32) NOT NULL UNIQUE,
    display_name VARCHAR(32) NOT NULL,
    course_id UUID NOT NULL,
    CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO subjects (course_id, subject_code, display_name) VALUES 
((SELECT id FROM courses WHERE course_code = '01'), 'MATHEMATICS_01', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '01'), 'ENGLISH_01', 'English'),
((SELECT id FROM courses WHERE course_code = '01'), 'HINDI_01', 'Hindi'),

((SELECT id FROM courses WHERE course_code = '02'), 'MATHEMATICS_02', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '02'), 'ENGLISH_02', 'English'),
((SELECT id FROM courses WHERE course_code = '02'), 'HINDI_02', 'Hindi'),

((SELECT id FROM courses WHERE course_code = '03'), 'MATHEMATICS_03', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '03'), 'ENGLISH_03', 'English'),
((SELECT id FROM courses WHERE course_code = '03'), 'HINDI_03', 'Hindi'),

((SELECT id FROM courses WHERE course_code = '04'), 'MATHEMATICS_04', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '04'), 'ENGLISH_04', 'English'),
((SELECT id FROM courses WHERE course_code = '04'), 'HINDI_04', 'Hindi'),

((SELECT id FROM courses WHERE course_code = '05'), 'MATHEMATICS_05', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '05'), 'ENGLISH_05', 'English'),
((SELECT id FROM courses WHERE course_code = '05'), 'HINDI_05', 'Hindi'),

((SELECT id FROM courses WHERE course_code = '06'), 'MATHEMATICS_06', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '06'), 'ENGLISH_06', 'English'),
((SELECT id FROM courses WHERE course_code = '06'), 'HINDI_06', 'Hindi'),
((SELECT id FROM courses WHERE course_code = '06'), 'SANSKRIT_06', 'Sanskrit'),
((SELECT id FROM courses WHERE course_code = '06'), 'SOCIAL_SCIENCE_06', 'Social Science'),
((SELECT id FROM courses WHERE course_code = '06'), 'SCIENCE_06', 'Science'),

((SELECT id FROM courses WHERE course_code = '07'), 'MATHEMATICS_07', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '07'), 'ENGLISH_07', 'English'),
((SELECT id FROM courses WHERE course_code = '07'), 'HINDI_07', 'Hindi'),
((SELECT id FROM courses WHERE course_code = '07'), 'SANSKRIT_07', 'Sanskrit'),
((SELECT id FROM courses WHERE course_code = '07'), 'SOCIAL_SCIENCE_07', 'Social Science'),
((SELECT id FROM courses WHERE course_code = '07'), 'SCIENCE_07', 'Science'),

((SELECT id FROM courses WHERE course_code = '08'), 'MATHEMATICS_08', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '08'), 'ENGLISH_08', 'English'),
((SELECT id FROM courses WHERE course_code = '08'), 'HINDI_08', 'Hindi'),
((SELECT id FROM courses WHERE course_code = '08'), 'SANSKRIT_08', 'Sanskrit'),
((SELECT id FROM courses WHERE course_code = '08'), 'SOCIAL_SCIENCE_08', 'Social Science'),
((SELECT id FROM courses WHERE course_code = '08'), 'SCIENCE_08', 'Science'),

((SELECT id FROM courses WHERE course_code = '09'), 'MATHEMATICS_09', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '09'), 'ENGLISH_09', 'English'),
((SELECT id FROM courses WHERE course_code = '09'), 'HINDI_09', 'Hindi'),
((SELECT id FROM courses WHERE course_code = '09'), 'SANSKRIT_09', 'Sanskrit'),
((SELECT id FROM courses WHERE course_code = '09'), 'SOCIAL_SCIENCE_09', 'Social Science'),
((SELECT id FROM courses WHERE course_code = '09'), 'SCIENCE_09', 'Science'),

((SELECT id FROM courses WHERE course_code = '10'), 'MATHEMATICS_10', 'Mathematics'),
((SELECT id FROM courses WHERE course_code = '10'), 'ENGLISH_10', 'English'),
((SELECT id FROM courses WHERE course_code = '10'), 'HINDI_10', 'Hindi'),
((SELECT id FROM courses WHERE course_code = '10'), 'SANSKRIT_10', 'Sanskrit'),
((SELECT id FROM courses WHERE course_code = '10'), 'SOCIAL_SCIENCE_10', 'Social Science'),
((SELECT id FROM courses WHERE course_code = '10'), 'SCIENCE_10', 'Science');