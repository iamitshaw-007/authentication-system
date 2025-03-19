CREATE TABLE languages(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(16) NOT NULL UNIQUE,
    code VARCHAR(8) NOT NULL UNIQUE
);

INSERT INTO languages (name, code) VALUES
('ENGLISH', 'EN'),
('HINDI', 'HI');