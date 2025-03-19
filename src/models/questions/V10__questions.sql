CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subjects_id UUID NOT NULL,
    question_types_id UUID NOT NULL,
    status VARCHAR(8) CHECK (status IN ('ACTIVE', 'INACTIVE')) NOT NULL DEFAULT 'ACTIVE',
    topic VARCHAR(64), 
    difficulty VARCHAR(8) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')) NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_subjects_id FOREIGN KEY (subjects_id) REFERENCES subjects(id),
    CONSTRAINT fk_question_types_id FOREIGN KEY (question_types_id) REFERENCES question_types(id)
    -- CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES academy_admins(id),
    -- CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES academy_admins(id)
);

CREATE TABLE question_tag_associations (
    question_id UUID NOT NULL,
    question_tag_id UUID NOT NULL,
    PRIMARY KEY (question_id, question_tag_id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_question_tag_id FOREIGN KEY (question_tag_id) REFERENCES question_tags(id)
);

CREATE TABLE question_version_associations (
    question_id UUID NOT NULL,
    question_version_id UUID NOT NULL,
    PRIMARY KEY (question_id, question_version_id),
    CONSTRAINT fk_question_id FOREIGN KEY (question_id) REFERENCES questions(id),
    CONSTRAINT fk_question_version_id FOREIGN KEY (question_version_id) REFERENCES question_versions(id)
);

CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO questions (
    subjects_id,
    question_types_id,
    status,
    topic,
    difficulty
)
VALUES (
    (SELECT id FROM subjects WHERE subject = 'MATHEMATICS'),
    (SELECT id FROM question_types WHERE type = 'NUMERIC'),
    'ACTIVE',
    'Time & Distance',
    'MEDIUM'
);

INSERT INTO question_version_associations(question_id, question_version_id) VALUES 
('103dcad8-d9a6-4e74-94a3-c4991423ffef', 'd8cbd3d7-ef60-4460-a3d6-87dd42b0fa98'),
('103dcad8-d9a6-4e74-94a3-c4991423ffef', '30aa1edb-1c60-4c92-9936-00c65d5102cd');

INSERT INTO question_tag_associations(question_id, question_tag_id) VALUES 
('103dcad8-d9a6-4e74-94a3-c4991423ffef', '26fd6a16-b0ef-4dc3-a4f0-6632cb48534d'),
('103dcad8-d9a6-4e74-94a3-c4991423ffef', 'f74eeba4-5daa-4a98-b41d-663aecd41945');
