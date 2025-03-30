CREATE TABLE paper_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(1) NOT NULL,
    description TEXT,
    CONSTRAINT unique_name UNIQUE (name),
    CONSTRAINT valid_name CHECK (name ~ '^[A-Z]$')
);

INSERT INTO paper_sets (name)
VALUES
    ('A'),
    ('B'),
    ('C'),
    ('D'),
    ('E'),
    ('F'),
    ('G'),
    ('H'),
    ('I'),
    ('J'),
    ('K'),
    ('L'),
    ('M'),
    ('N'),
    ('O'),
    ('P'),
    ('Q'),
    ('R'),
    ('S'),
    ('T'),
    ('U'),
    ('V'),
    ('W'),
    ('X'),
    ('Y'),
    ('Z');