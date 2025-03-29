CREATE TABLE question_version_associations (
    question_id UUID NOT NULL,
    question_version_id UUID NOT NULL,
    PRIMARY KEY (question_id, question_version_id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_question_version_id FOREIGN KEY (question_version_id) REFERENCES question_versions(id)
);