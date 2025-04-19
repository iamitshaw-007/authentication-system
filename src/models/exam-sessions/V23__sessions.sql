CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    actual_start_date date,
    actual_start_time time,
    actual_end_time time,
    exam_address_id UUID NOT NULL,
    does_manual_start_needed VARCHAR(4) NOT NULL CHECK (does_manual_start_needed IN ('YES', 'NO')),
    does_manual_end_needed VARCHAR(4) NOT NULL CHECK (does_manual_end_needed IN ('YES', 'NO')),
    does_manual_review_needed VARCHAR(4) NOT NULL CHECK (does_manual_review_needed IN ('YES', 'NO')),
    does_time_remaining_modal_needed VARCHAR(4) NOT NULL CHECK (does_time_remaining_modal_needed IN ('YES', 'NO')),
    time_remaining_modal_shown_at INTEGER CHECK (
        (does_time_remaining_modal_needed = 'YES' AND time_remaining_modal_shown_at IS NOT NULL)
        OR (does_time_remaining_modal_needed = 'NO' AND time_remaining_modal_shown_at IS NULL)
    ),
    status VARCHAR(16) NOT NULL CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED')) DEFAULT 'SCHEDULED',
    credential_delivery_method VARCHAR(8) NOT NULL CHECK (credential_delivery_method IN ('MANUAL', 'EMAIL')),
    does_exam_paper_set_assignment_needed VARCHAR(4) NOT NULL CHECK (does_exam_paper_set_assignment_needed IN ('YES', 'NO')),
    does_attendance_required VARCHAR(4) NOT NULL CHECK (does_attendance_required IN ('YES', 'NO')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    -- CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES academy_admins(id),
    -- CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES academy_admins(id),
    CONSTRAINT fk_exam_address_id FOREIGN KEY (exam_address_id) REFERENCES addresses(id)
);