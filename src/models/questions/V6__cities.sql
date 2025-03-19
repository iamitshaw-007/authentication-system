CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(128) NOT NULL,
    state_id UUID NOT NULL,
    CONSTRAINT fk_state_id FOREIGN KEY (state_id) REFERENCES states(id)
);

INSERT INTO cities (city, state_id)
SELECT city, (SELECT id FROM states WHERE state = 'Bihar')
FROM (
    VALUES
        ('Patna'),
        ('Gaya'),
        ('Bhagalpur'),
        ('Muzaffarpur'),
        ('Purnia'),
        ('Darbhanga'),
        ('Arrah'),
        ('Begusarai'),
        ('Bettiah'),
        ('Buxar'),
        ('Chhapra'),
        ('Hajipur'),
        ('Jamalpur'),
        ('Katihar'),
        ('Madhubani'),
        ('Motihari'),
        ('Munger'),
        ('Nawada'),
        ('Saharsa'),
        ('Samastipur'),
        ('Sasaram'),
        ('Siwan'),
        ('Aurangabad'),
        ('Bhabua'),
        ('Bihar Sharif'),
        ('Bodh Gaya'),
        ('Dehri'),
        ('Forbesganj'),
        ('Gopalganj'),
        ('Jehanabad'),
        ('Khagaria'),
        ('Kishanganj'),
        ('Lakhisarai'),
        ('Madhepura'),
        ('Sheikhpura'),
        ('Sitamarhi'),
        ('Supaul'),
        ('Vaishali')
    ) AS temp_cities(city);