CREATE TABLE question_version_associations (
    question_id UUID NOT NULL,
    question_version_id UUID NOT NULL,
    language_id UUID NOT NULL,
    PRIMARY KEY (question_id, question_version_id, language_id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_question_version_id FOREIGN KEY (question_version_id) REFERENCES question_versions(id),
    CONSTRAINT fk_language_id FOREIGN KEY (language_id) REFERENCES languages(id)
);

INSERT INTO question_version_associations (question_id, question_version_id, language_id) 
VALUES ('ac580240-e87b-47cf-854d-1c01848a63a5', '66279974-aac1-4103-a192-b88d2c7f99cb', 'f452b880-dcfa-4059-a347-de024de8313b'),
('ac580240-e87b-47cf-854d-1c01848a63a5', '1b006fb5-ea7d-4bce-88b9-1d284f1b95f8', '479a796a-23ee-406e-8305-056d8ea609ec'),
('b5235a8c-a29f-4a79-9a4b-63311cdab878', 'f16016de-b4da-42f9-9f1a-bbf6c8ef7c09', 'f452b880-dcfa-4059-a347-de024de8313b'),
('b5235a8c-a29f-4a79-9a4b-63311cdab878', '6931f2d9-0dc8-44c0-86b8-c5d7c9ea6a5a', '479a796a-23ee-406e-8305-056d8ea609ec');