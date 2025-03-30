CREATE TABLE question_tags(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_tag VARCHAR(64) NOT NULL UNIQUE,
    category VARCHAR(64) NOT NULL,
    description TEXT
);

INSERT INTO question_tags(question_tag, category, description) VALUES 
('BSEB2025', 'BSEB', 'Bihar Board Question Paper'),
('BSEB2024', 'BSEB', 'Bihar Board Question Paper'),
('BSEB2023', 'BSEB', 'Bihar Board Question Paper'),
('BSEB2022', 'BSEB', 'Bihar Board Question Paper'),
('BSEB2021', 'BSEB', 'Bihar Board Question Paper'),
('CBSE2025', 'CBSE', 'CBSE Board Question Paper'),
('CBSE2024', 'CBSE', 'CBSE Board Question Paper'),
('CBSE2023', 'CBSE', 'CBSE Board Question Paper'),
('CBSE2022', 'CBSE', 'CBSE Board Question Paper'),
('CBSE2021', 'CBSE', 'CBSE Board Question Paper');