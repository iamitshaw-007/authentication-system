CREATE TABLE question_versions(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    language_id UUID NOT NULL,
    question_type_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    multiple_choice_options JSONB,
    multiple_choice_answer VARCHAR(4),
    numeric_answer NUMERIC,
    fill_in_the_blank_answer TEXT,
    descriptive_answer TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    CONSTRAINT fk_language_id FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_question_type_id FOREIGN KEY (question_type_id) REFERENCES question_types(id)
);

CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON question_versions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO question_versions (
    language_id,
    question_type_id,
    question_text,
    numeric_answer
)
VALUES (
    (SELECT id FROM languages WHERE language_name ilike '%eng%'),
    (SELECT id FROM question_types WHERE question_type ilike '%num%'),
    '<p> A train travels from point A to point B at an average speed of 60 km/h and returns from point B to point A at an average speed of 40 km/h. What is the average speed of the train for the entire journey, in km/h? </p>',
    48
);

INSERT INTO question_versions (
    language_id,
    question_type_id,
    question_text,
    numeric_answer
)
VALUES (
    (SELECT id FROM languages WHERE language_name ilike '%hin%'),
    (SELECT id FROM question_types WHERE question_type ilike '%num%'),
    '<p> एक ट्रेन बिंदु A से बिंदु B तक 60 किमी/घंटा की औसत गति से यात्रा करती है और बिंदु B से बिंदु A तक 40 किमी/घंटा की औसत गति से वापस आती है। पूरी यात्रा के लिए ट्रेन की औसत गति क्या है, किमी/घंटा में? </p>',
    48
);