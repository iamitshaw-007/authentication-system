CREATE TABLE courses(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(16) NOT NULL,
    title VARCHAR(16) NOT NULL,
    course_code VARCHAR(8) NOT NULL
);

INSERT INTO courses (name, title, course_code)
VALUES
    ('class_01', 'Class - I', '01'),
    ('class_02', 'Class - II', '02'),
    ('class_03', 'Class - III', '03'),
    ('class_04', 'Class - IV', '04'),
    ('class_05', 'Class - V', '05'),
    ('class_06', 'Class - VI', '06'),
    ('class_07', 'Class - VII', '07'),
    ('class_08', 'Class - VIII', '08'),
    ('class_09', 'Class - IX', '09'),
    ('class_10', 'Class - X', '10');