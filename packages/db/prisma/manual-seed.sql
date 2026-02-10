-- Create admin user with hashed password (bcrypt hash of "Admin@2025")
INSERT INTO "User" (id, email, password, "fullName", role, phone, "physicalAddress", "brelaNumber", "tinNumber", "natureOfBusiness", "createdAt")
VALUES (
  gen_random_uuid(),
  'admin@tiip.co.tz',
  '$2b$10$eTPrV/JSVvxPsEufNNSJU.ehnCRjlOe3FmP0KwRH0EAzSvu.JdtNa',  -- bcrypt hash of "Admin@2025"
  'System Administrator',
  'ADMIN',
  '+255000000000',
  'Dar es Salaam, Tanzania',
  'ADMIN001',
  'ADMIN001',
  'Insurance Administration',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create insurance policies
INSERT INTO "InsurancePolicy" (id, name, description, "clauseType", "isActive", rate, "minPremium", "createdAt")
VALUES
  (gen_random_uuid(), 'Marine Cargo ICC (A)', 'Comprehensive all-risks coverage for marine cargo shipments. Covers all risks of physical loss or damage from any external cause.', 'ICC(A)', true, 0.5, 50000, NOW()),
  (gen_random_uuid(), 'Marine Cargo ICC (B)', 'Intermediate coverage for marine cargo. Covers fire, explosion, vessel stranding, sinking, collision, and other named perils.', 'ICC(B)', true, 0.35, 35000, NOW()),
  (gen_random_uuid(), 'Marine Cargo ICC (C)', 'Basic coverage for marine cargo. Covers fire, explosion, vessel stranding, sinking, and collision only.', 'ICC(C)', true, 0.25, 25000, NOW())
ON CONFLICT DO NOTHING;

-- Display success message
SELECT 'Database seeded successfully!' AS message;
