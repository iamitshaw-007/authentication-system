CREATE TABLE academy(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academy_name VARCHAR(64) NOT NULL,
    academy_address_id UUID NOT NULL,
    official_contact_number VARCHAR(16) NOT NULL,
    official_email_id VARCHAR(64) NOT NULL,
    academy_display_id VARCHAR(64) NOT NULL,
    academy_logo TEXT NOT NULL,
    estd_on date NOT NULL,
    status VARCHAR(8) NOT NULL CHECK(status IN ('ACTIVE', 'INACTIVE')) DEFAULT('ACTIVE'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    CONSTRAINT fk_academy_address_id FOREIGN KEY (academy_address_id) REFERENCES addresses(id)
);

CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON academy
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();