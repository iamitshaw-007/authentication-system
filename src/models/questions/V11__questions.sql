CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    course_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    question_type_id UUID NOT NULL,
    status VARCHAR(8) CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
    topic VARCHAR(64), 
    difficulty VARCHAR(8) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')) NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_subject_id FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_question_type_id FOREIGN KEY (question_type_id) REFERENCES question_types(id)
    -- CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES academy_admins(id),
    -- CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES academy_admins(id)
);

CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO questions (
    subject_id,
    question_type_id,
    status,
    topic,
    difficulty
)
VALUES (
    (SELECT id FROM subjects WHERE subject_code = 'MATHEMATICS_10'),
    (SELECT id FROM question_types WHERE quesion_type = 'NUMERIC'),
    'ACTIVE',
    'Time & Distance',
    'MEDIUM'
);
