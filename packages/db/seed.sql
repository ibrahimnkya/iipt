-- Insert admin user
INSERT INTO "User" (id, email, password, "fullName", role, phone, "physicalAddress", "brelaNumber", "tinNumber", "natureOfBusiness", "createdAt")
VALUES (
  gen_random_uuid(),
  'admin@tiips.co.tz',
  '$2a$10$YourHashedPasswordHere',
  'System Administrator',
  'ADMIN',
  '+255000000000',
  'Dar es Salaam, Tanzania',
  'ADMIN001',
  'ADMIN001',
  'Insurance Administration',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert insurance policies
INSERT INTO "InsurancePolicy" (id, name, "clauseType", description, rate, "isActive", "createdAt")
VALUES
  ('icc-a-policy', 'Institute Cargo Clauses (A)', 'ICC A', 'All risks coverage - most comprehensive', 0.35, true, NOW()),
  ('icc-b-policy', 'Institute Cargo Clauses (B)', 'ICC B', 'Named perils coverage - intermediate', 0.25, true, NOW()),
  ('icc-c-policy', 'Institute Cargo Clauses (C)', 'ICC C', 'Basic coverage - minimum protection', 0.15, true, NOW())
ON CONFLICT (id) DO NOTHING;
