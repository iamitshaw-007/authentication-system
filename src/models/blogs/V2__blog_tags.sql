CREATE TABLE blog_tags(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_tag VARCHAR(64) NOT NULL UNIQUE,
    category VARCHAR(64) NOT NULL,
    description TEXT
);

INSERT INTO blog_tags (
    blog_tag,
    category,
    description
)
VALUES (
    'Artificial Intelligence',
    'Technology',
    'Artificial intelligence refers to the development of computer systems that can perform tasks that typically require human intelligence.'
),
(
    'Python Programming',
    'Programming',
    'Python is a high-level, interpreted programming language that is easy to learn and fun to use.'
),
(
    'Machine Learning',
    'Technology',
    'Machine learning is a subset of artificial intelligence that involves the use of algorithms to analyze data and make predictions.'
),
(
    'Data Science',
    'Technology',
    'Data science is a field that combines data analysis, machine learning, and programming to extract insights from data.'
);