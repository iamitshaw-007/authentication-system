CREATE TABLE question_version_associations (
    question_id UUID NOT NULL,
    question_version_id UUID NOT NULL,
    PRIMARY KEY (question_id, question_version_id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_question_version_id FOREIGN KEY (question_version_id) REFERENCES question_versions(id)
);

INSERT INTO question_version_associations (question_id, question_version_id) 
VALUES ('ddff70e2-17bc-45f6-a542-775eb4fa47ba', '7b3a4c36-76be-49d6-880e-484f2d6a9394');