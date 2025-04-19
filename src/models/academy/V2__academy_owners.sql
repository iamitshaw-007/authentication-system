CREATE TABLE academy_owners(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_id UUID NOT NULL,
    first_name VARCHAR(32) NOT NULL,
    middle_name VARCHAR(32),
    last_name VARCHAR(32) NOT NULL,
    phone_number VARCHAR(16) NOT NULL,
    email_id VARCHAR(64) NOT NULL,
    owner_address_id UUID NOT NULL,
    user_name VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK(status IN ('ACTIVE', 'INACTIVE')) DEFAULT('ACTIVE'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    CONSTRAINT unique_user_name UNIQUE (user_name),
    CONSTRAINT fk_owner_address_id FOREIGN KEY (owner_address_id) REFERENCES addresses(id),
    CONSTRAINT fk_academy_id FOREIGN KEY (academy_id) REFERENCES academy(id)
);