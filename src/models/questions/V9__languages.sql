CREATE TABLE languages(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    language_name VARCHAR(16) NOT NULL UNIQUE,
    language_code VARCHAR(4) NOT NULL UNIQUE,
    display_name VARCHAR(16) NOT NULL UNIQUE
);

INSERT INTO languages (language_name, language_code, display_name) VALUES
('ENGLISH', 'EN', 'English'),
('HINDI', 'HI', 'Hindi');