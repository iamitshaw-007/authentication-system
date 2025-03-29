CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    entity_type_id UUID NOT NULL,
    address_type VARCHAR(16) CHECK (address_type IN ('PRIMARY', 'SECONDARY', 'MAILING', 'BILLING')) NOT NULL DEFAULT 'PRIMARY',
    address_line_1 VARCHAR(256) NOT NULL,
    address_line_2 VARCHAR(256),
    city_id UUID NOT NULL,
    state_id UUID NOT NULL,
    country VARCHAR(16) NOT NULL DEFAULT 'INDIA',
    postal_code VARCHAR(8) NOT NULL CHECK (postal_code ~ '^[1-9][0-9]{5}$'),
    phone_number VARCHAR(16) CHECK (phone_number ~ '^[6-9]\d{9}$'),
    contact_name VARCHAR(64),
    contact_email VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_entity_type_id FOREIGN KEY (entity_type_id) REFERENCES entity_types(id),
    CONSTRAINT fk_city_id FOREIGN KEY (city_id) REFERENCES cities(id),
    CONSTRAINT fk_state_id FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE OR REPLACE TRIGGER trigger_for_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


INSERT INTO addresses(entity_type_id, address_type, address_line_1, 
address_line_2, city_id, state_id, country, postal_code, 
phone_number, contact_name, contact_email) VALUES
((SELECT id FROM entity_types WHERE type = 'ADMIN'), 'PRIMARY', 
'114/B, parshurampur', 'near primary school', 
(SELECT id FROM cities WHERE city = 'Jehanabad'),
(SELECT id FROM states WHERE state = 'Bihar'), 'INDIA', 
'804428', '8789906286', 'Amit Shaw', 'imamitshaw.61@gmial.com'),
((SELECT id FROM entity_types WHERE type = 'ADMIN'), 'SECONDARY', 
'114/B, parshurampur', 'near primary school', 
(SELECT id FROM cities WHERE city = 'Jehanabad'),
(SELECT id FROM states WHERE state = 'Bihar'), 'INDIA', 
'804428', '9523381217', 'Ajeet Shaw', 'imajeetshaw.99@gmial.com');
