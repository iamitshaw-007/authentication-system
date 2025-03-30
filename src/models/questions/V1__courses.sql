CREATE TABLE courses(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_name VARCHAR(16) NOT NULL UNIQUE,
    display_name VARCHAR(16) NOT NULL UNIQUE,
    course_code VARCHAR(8) NOT NULL UNIQUE
);

INSERT INTO courses (course_name, display_name, course_code)
VALUES
    ('CLASS_01', 'Class - I', '01'),
    ('CLASS_02', 'Class - II', '02'),
    ('CLASS_03', 'Class - III', '03'),
    ('CLASS_04', 'Class - IV', '04'),
    ('CLASS_05', 'Class - V', '05'),
    ('CLASS_06', 'Class - VI', '06'),
    ('CLASS_07', 'Class - VII', '07'),
    ('CLASS_08', 'Class - VIII', '08'),
    ('CLASS_09', 'Class - IX', '09'),
    ('CLASS_10', 'Class - X', '10');