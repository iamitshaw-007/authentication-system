CREATE TABLE departments(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name VARCHAR(32) NOT NULL,
    head_of_department_id UUID NOT NULL,
    office_contact_number VARCHAR(16) NOT NULL,
    estd_on date NOT NULL,
    description TEXT NOT NULL,
    department_code VARCHAR(32) NOT NULL CHECK(department_code IN ('PRIMARY_EDUCATION', 'SECONDARY_EDUCATION', 'HIGHER_SECONDARY_EDUCATION', 'COMPETITIVE_EXAM')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    CONSTRAINT fk_head_of_department_id FOREIGN KEY (head_of_department_id) REFERENCES instructors(id)
);