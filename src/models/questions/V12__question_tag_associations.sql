CREATE TABLE question_tag_associations (
    question_id UUID NOT NULL,
    question_tag_id UUID NOT NULL,
    PRIMARY KEY (question_id, question_tag_id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_question_tag_id FOREIGN KEY (question_tag_id) REFERENCES question_tags(id)
);

INSERT INTO question_tag_associations (question_id, question_tag_id) 
VALUES ('ddff70e2-17bc-45f6-a542-775eb4fa47ba', '788a5a98-4a65-478f-a658-22bcdc20b305'),
('ddff70e2-17bc-45f6-a542-775eb4fa47ba', '95f868ab-55d5-4024-99cc-b2448183fdc5'),
('ddff70e2-17bc-45f6-a542-775eb4fa47ba', 'e6c33df5-f6a3-423a-8c08-5d7402e0fbb9'), 
('ddff70e2-17bc-45f6-a542-775eb4fa47ba', '83a03135-a571-43f3-bb4c-e73650fb20d8');