CREATE TABLE question_versions(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    languages_id UUID NOT NULL,
    question_types_id UUID NOT NULL,
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
    CONSTRAINT fk_languages_id FOREIGN KEY (languages_id) REFERENCES languages(id),
    CONSTRAINT fk_question_types_id FOREIGN KEY (question_types_id) REFERENCES question_types(id)
);

CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON question_versions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO question_versions (
    languages_id,
    question_types_id,
    question_text,
    numeric_answer
)
VALUES (
    (SELECT id FROM languages WHERE name ilike '%english%'),
    (SELECT id FROM question_types WHERE type ilike '%numeric%'),
    '<p> A train travels from point A to point B at an average speed of 60 km/h and returns from point B to point A at an average speed of 40 km/h. What is the average speed of the train for the entire journey, in km/h? </p>',
    48
);

INSERT INTO question_versions (
    languages_id,
    question_types_id,
    question_text,
    numeric_answer
)
VALUES (
    (SELECT id FROM languages WHERE name ilike '%hindi%'),
    (SELECT id FROM question_types WHERE type ilike '%numeric%'),
    '<p> एक ट्रेन बिंदु A से बिंदु B तक 60 किमी/घंटा की औसत गति से यात्रा करती है और बिंदु B से बिंदु A तक 40 किमी/घंटा की औसत गति से वापस आती है। पूरी यात्रा के लिए ट्रेन की औसत गति क्या है, किमी/घंटा में? </p>',
    48
);