CREATE TABLE languages(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(16) NOT NULL UNIQUE,
    code VARCHAR(8) NOT NULL UNIQUE,
    display_name VARCHAR(16) NOT NULL UNIQUE
);

INSERT INTO languages (name, code, display_name) VALUES
('english', 'EN', 'English'),
('hindi', 'HI', 'Hindi');