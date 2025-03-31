CREATE TABLE question_versions(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language_id UUID NOT NULL,
    question_type_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    multiple_choice_options JSONB,
    multiple_choice_answer VARCHAR(1) CHECK(multiple_choice_answer IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
    numeric_answer NUMERIC,
    fill_in_the_blank_answer TEXT,
    descriptive_answer TEXT,
    CONSTRAINT fk_language_id FOREIGN KEY (language_id) REFERENCES languages(id),
    CONSTRAINT fk_question_type_id FOREIGN KEY (question_type_id) REFERENCES question_types(id)
);

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
), (
    (SELECT id FROM languages WHERE language_name ilike '%hin%'),
    (SELECT id FROM question_types WHERE question_type ilike '%num%'),
    '<p> एक ट्रेन बिंदु A से बिंदु B तक 60 किमी/घंटा की औसत गति से यात्रा करती है और बिंदु B से बिंदु A तक 40 किमी/घंटा की औसत गति से वापस आती है। पूरी यात्रा के लिए ट्रेन की औसत गति क्या है, किमी/घंटा में? </p>',
    48
);

INSERT INTO question_versions(
    language_id,
    question_type_id,
    question_text,
    multiple_choice_options,
    multiple_choice_answer
) VALUES (
    (SELECT id FROM languages WHERE language_name ilike '%eng%'),
    (SELECT id FROM question_types WHERE question_type ilike '%mul%'),
    '<p>What is the largest planet in our solar system?</p>',
    '{"A":"Earth", "B":"Saturn", "C":"Jupiter", "D": "Uranus"}',
    'C'
), (
    (SELECT id FROM languages WHERE language_name ilike '%hin%'),
    (SELECT id FROM question_types WHERE question_type ilike '%mul%'),
    '<p>सौर मंडल में सबसे बड़ा ग्रह कौन सा है?</p>',
    '{"A":"पृथ्वी", "B":"शनि", "C":"बृहस्पति", "D": "यूरेनस"}',
    'C'
);