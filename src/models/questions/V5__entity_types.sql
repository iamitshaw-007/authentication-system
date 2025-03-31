CREATE TABLE entity_types(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(32) NOT NULL UNIQUE
);

INSERT INTO entity_types (entity_type) VALUES 
('ACADEMY'),
('ADMIN'),
('STUDENT'),
('EXAM_SESSION');