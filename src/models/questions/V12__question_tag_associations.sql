CREATE TABLE question_tag_associations (
    question_id UUID NOT NULL,
    question_tag_id UUID NOT NULL,
    PRIMARY KEY (question_id, question_tag_id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_question_tag_id FOREIGN KEY (question_tag_id) REFERENCES question_tags(id)
);

INSERT INTO question_tag_associations (question_id, question_tag_id) 
VALUES ('ac580240-e87b-47cf-854d-1c01848a63a5', 'f75e5c7f-5119-4094-a28c-3529341e4210'),
('ac580240-e87b-47cf-854d-1c01848a63a5', '471d9651-1683-4af9-ac51-17af7b4d121f'),
('b5235a8c-a29f-4a79-9a4b-63311cdab878', 'e39a7d03-f849-4ea0-bdb4-bea53338d3ae'), 
('b5235a8c-a29f-4a79-9a4b-63311cdab878', 'd5d8ea7b-c166-45eb-b613-6345e78eeaab');