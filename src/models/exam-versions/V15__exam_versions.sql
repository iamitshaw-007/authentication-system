CREATE TABLE exam_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_instructions TEXT NOT NULL CHECK (LENGTH(exam_instructions) > 0),
    passing_score INTEGER NOT NULL CHECK (passing_score > 0),
    total_score INTEGER NOT NULL CHECK (total_score > 0),
    languages_id UUID NOT NULL,
    course_id UUID NOT NULL,
    exam_version_name VARCHAR(32) NOT NULL,
    has_resource_booklet VARCHAR(4) NOT NULL CHECK (has_resource_booklet IN ('YES', 'NO')),
    resource_booklet_information VARCHAR(128) CHECK (
        (has_resource_booklet = 'Yes' AND resource_booklet_information IS NOT NULL)
        OR (has_resource_booklet = 'No' AND resource_booklet_information IS NULL)
    ),
    has_sections VARCHAR(4) NOT NULL CHECK (has_sections IN ('YES', 'NO')),
    has_question_sets VARCHAR(4) NOT NULL CHECK (has_sections IN ('YES', 'NO')),
    status VARCHAR(8) NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_languages_id FOREIGN KEY (languages_id) REFERENCES languages(id),
    CONSTRAINT fk_courses_id FOREIGN KEY (course_id) REFERENCES courses(id), 
    CHECK (total_score > passing_score)  
);


CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON exam_versions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO exam_versions (
    exam_instructions,
    passing_score,
    total_score,
    languages_id,
    course_id,
    exam_version_name,
    has_resource_booklet,
    resource_booklet_information,
    has_sections,
    status
)
VALUES (
    '<ol><li><strong>Introduction and Instructions</strong>: All questions regarding the examination should be asked during the introductory instruction period. Only procedural questions will be allowed during the examination.</li><li><strong>Examination Format</strong>: Work through the entire examination at your own pace. There are no time limits on individual sections.</li><li><strong>Allowed Materials</strong>: No books, notes, or papers of any kind are permitted. Scrap paper will be provided for your use during the examination.</li><li><strong>Reference Materials</strong>: All necessary mathematical formulas, conversion factors, reference charts, and views are provided in the <strong>Resource Booklet</strong>, which will be distributed at the start of the examination.</li><li><strong>Calculators</strong>: Calculators are permitted for use during the examination.</li><li><strong>Time Allocation</strong>: You will be allowed the entire <strong>five (5) hours</strong> allotted for the total examination session. Use your time wisely to complete all sections of the examination.</li><li><strong>Conduct</strong>: Please conduct yourself in a professional and respectful manner during the examination. Any form of cheating or misconduct will not be tolerated.</li></ol>',
    40,
    100,
    'aa1a2e16-4e09-47e6-b403-86b1916f2a07',
    '78502967-bd7d-44ad-aeee-18feb1975a6e',
    '2025-class_I-EN-unitTest',
    'YES',
    's3BucketLink',
    'YES',
    'ACTIVE'
);