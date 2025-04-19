CREATE TABLE blog_posts(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- academy_id UUID NOT NULL,
    -- instructor_id UUID NOT NULL,
    display_id SERIAL NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    blog_post_state VARCHAR(16) NOT NULL CHECK(blog_post_state IN ('DRAFT', 'PUBLISHED')),
    status VARCHAR(8) NOT NULL CHECK(status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_display_id UNIQUE (display_id)
    -- CONSTRAINT fk_academy_id FOREIGN KEY (academy_id) REFERENCES academy(id),
    -- CONSTRAINT fk_instructor_id FOREIGN KEY (instructor_id) REFERENCES instructors(id)
);

CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO blog_posts (
    title,
    description,
    content,
    blog_post_state,
    status
)
VALUES (
    '<h1> Introduction to Artificial Intelligence </h1>',
    '<h3> In this blog post, we will explore the basics of <b>artificial intelligence</b> and its applications in the modern world. </h3>',
    '<p> Artificial intelligence (AI) refers to the development of computer systems that can perform tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and language translation.</p><p>AI has been a rapidly growing field in recent years, with many applications in areas such as <a href="https://www.example.com/healthcare">healthcare</a>, <a href="https://www.example.com/finance">finance</a>, and <a href="https://www.example.com/transportation">transportation</a>.</p><p>In this blog post, we will delve into the world of AI and explore its potential to transform the way we live and work. </p>',
    'DRAFT',
    'ACTIVE'
), (
    '<h1> Getting Started with <code>Python Programming</code> </h1>',
    '<h3> Learn the basics of Python programming and start building your own projects with our comprehensive guide. </h3>',
    '<h2> Introduction to Python</h2><p>Python is a high-level, interpreted programming language that is easy to learn and fun to use.</p><p>With Python, you can build a wide range of applications, from simple scripts to complex machine learning models.</p><h3>Setting up Your Development Environment</h3><ol><li>Install Python on your computer</li><li>Choose a text editor or IDE</li><li>Start coding!</li></ol><p>Check out our <a href="https://www.example.com/python-tutorial">Python tutorial</a> for more information and get started with Python today! </p>',
    'DRAFT',
    'ACTIVE'
);