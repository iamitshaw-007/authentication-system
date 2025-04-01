CREATE TABLE exam_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_instructions TEXT NOT NULL CHECK (LENGTH(exam_instructions) > 0),
    passing_score INTEGER NOT NULL CHECK (passing_score > 0),
    total_score INTEGER NOT NULL CHECK (total_score > 0),
    language_id UUID NOT NULL,
    course_id UUID NOT NULL,
    exam_version_name VARCHAR(32) NOT NULL,
    has_resource_booklet VARCHAR(4) NOT NULL CHECK (has_resource_booklet IN ('YES', 'NO')),
    resource_booklet_information VARCHAR(128) CHECK (
        (has_resource_booklet = 'YES' AND resource_booklet_information IS NOT NULL)
        OR (has_resource_booklet = 'NO' AND resource_booklet_information IS NULL)
    ),
    has_sections VARCHAR(4) NOT NULL CHECK (has_sections IN ('YES', 'NO')),
    has_paper_sets VARCHAR(4) NOT NULL CHECK (has_paper_sets IN ('YES', 'NO')),
    status VARCHAR(8) CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    -- CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES academy_admins(id),
    -- CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES academy_admins(id),
    CONSTRAINT fk_language_id FOREIGN KEY (language_id) REFERENCES languages(id),
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
    language_id,
    course_id,
    exam_version_name,
    has_resource_booklet,
    resource_booklet_information,
    has_sections,
    has_paper_sets,
    status
)
VALUES (
    '<ol><li><strong>Introduction and Instructions</strong>: All questions regarding the examination should be asked during the introductory instruction period. Only procedural questions will be allowed during the examination.</li><li><strong>Examination Format</strong>: Work through the entire examination at your own pace. There are no time limits on individual sections.</li></ol>',
    35,
    100,
    (SELECT id FROM languages WHERE language_code = 'EN'),
    (SELECT id FROM courses WHERE course_code = '10'),
    '2025-class_I-EN-unitTest',
    'YES',
    's3BucketLink',
    'YES',
    'YES',
    'ACTIVE'
);
