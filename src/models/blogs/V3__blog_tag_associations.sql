CREATE TABLE blog_tag_associations (
    blog_post_id UUID NOT NULL,
    blog_tag_id UUID NOT NULL,
    PRIMARY KEY (blog_post_id, blog_tag_id),
    CONSTRAINT fk_blog_post_id FOREIGN KEY (blog_post_id) REFERENCES blog_posts(id),
    CONSTRAINT fk_blog_tag_id FOREIGN KEY (blog_tag_id) REFERENCES blog_tags(id)
);

INSERT INTO blog_tag_associations (
    blog_post_id,
    blog_tag_id
)
VALUES (
    (SELECT id FROM blog_posts WHERE display_id = '1'),
    (SELECT id FROM blog_tags WHERE blog_tag = 'Artificial Intelligence')
),
(
    (SELECT id FROM blog_posts WHERE display_id = '1'),
    (SELECT id FROM blog_tags WHERE blog_tag = 'Machine Learning')
),
(
    (SELECT id FROM blog_posts WHERE display_id = '2'),
    (SELECT id FROM blog_tags WHERE blog_tag = 'Python Programming')
),
(
    (SELECT id FROM blog_posts WHERE display_id = '2'),
    (SELECT id FROM blog_tags WHERE blog_tag = 'Data Science')
);