CREATE TABLE question_types(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(32) NOT NULL UNIQUE
);

INSERT INTO question_types (type) VALUES
('MULTIPLE_CHOICE'),
('FILL_IN_THE_BLANK'),
('DESCRIPTIVE'),
('NUMERIC');