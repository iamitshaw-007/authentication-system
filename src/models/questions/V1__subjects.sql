CREATE TABLE subjects(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(32) NOT NULL UNIQUE,
    display_name VARCHAR(32) NOT NULL UNIQUE
);

INSERT INTO subjects (subject, display_name) VALUES 
('mathematics', 'Mathematics'),
('physics', 'Physics'),
('chemistry', 'Chemistry'),
('biology', 'Biology'),
('english', 'English'),
('hindi', 'Hindi'),
('sanskrit', 'Sanskrit'),
('history', 'History'),
('geography', 'Geography'),
('economy', 'Economy'),
('political_science', 'Political Science'),
('computer_science', 'Computer Science');