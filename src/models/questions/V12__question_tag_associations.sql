CREATE TABLE question_tag_associations (
    question_id UUID NOT NULL,
    question_tag_id UUID NOT NULL,
    PRIMARY KEY (question_id, question_tag_id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_question_tag_id FOREIGN KEY (question_tag_id) REFERENCES question_tags(id)
);