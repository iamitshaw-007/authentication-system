CREATE TABLE question_tags(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag VARCHAR(64) NOT NULL UNIQUE
);

INSERT INTO question_tags(tag) VALUES 
('BSEB2025'),
('BSEB2024'),
('BSEB2023'),
('BSEB2022'),
('BSEB2021'),
('CBSE2025'),
('CBSE2024'),
('CBSE2023'),
('CBSE2022'),
('CBSE2021');