CREATE TABLE question_types(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_type VARCHAR(32) NOT NULL UNIQUE,
    display_name VARCHAR(32) NOT NULL UNIQUE
);

INSERT INTO question_types (question_type, display_name) VALUES
('MULTIPLE_CHOICE', 'Multiple choice'),
('FILL_IN_THE_BLANK', 'Fill in the blank'),
('DESCRIPTIVE', 'Descriptive'),
('NUMERIC', 'Numeric');