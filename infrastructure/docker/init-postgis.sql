-- Initialize Standard PostgreSQL Database for UyTop
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Standard B-tree and composite indexing strategy for high performance queries
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'properties'
    ) THEN
        -- B-tree indexes for fast faceted filtering & coordinate lookups
        CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties (latitude, longitude);
        CREATE INDEX IF NOT EXISTS idx_properties_district ON properties (district);
        CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price_uzs);
        CREATE INDEX IF NOT EXISTS idx_properties_rooms ON properties (rooms);
        CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
        CREATE INDEX IF NOT EXISTS idx_properties_transaction_type ON properties (transaction_type);
        CREATE INDEX IF NOT EXISTS idx_properties_city_district ON properties (city, district);
    END IF;
END $$;
