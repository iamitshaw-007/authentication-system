CREATE TABLE entity_types(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(32) NOT NULL UNIQUE
);

INSERT INTO entity_types (type) VALUES 
('ACADEMY'),
('ADMIN'),
('STUDENT'),
('EXAM_SESSION');
