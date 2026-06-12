// Ensure we use the correct DATABASE_URL for Docker
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:password@localhost:5433/tiips_db?schema=public";

import { prisma } from "../index";
import bcrypt from "bcryptjs";

async function main() {
    console.log("🌱 Starting database seed...");

    // Create admin user
    const adminEmail = "admin@iipt.co.tz";
    const adminPassword = "Admin@2025";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: hashedAdminPassword },
        create: {
            email: adminEmail,
            password: hashedAdminPassword,
            fullName: "System Administrator",
            role: "ADMIN",
            phone: "+255000000000",
            physicalAddress: "Dar es Salaam, Tanzania",
            brelaNumber: "ADMIN001",
            tinNumber: "ADMIN001",
            natureOfBusiness: "Insurance Administration",
        },
    });

    console.log("✅ Admin user created:", admin.email);

    // Create Insurers
    const insurers = [
        { email: "info@jubilee.co.tz", password: "Ibra@0473", fullName: "Jubilee Insurance" },
        { email: "info@strategis.co.tz", password: "Pass@123", fullName: "Strategis Insurance" },
        { email: "info@alliance.co.tz", password: "Pass@123", fullName: "Alliance Insurance" },
    ];

    for (const insurerData of insurers) {
        const hashedInsurerPassword = await bcrypt.hash(insurerData.password, 10);
        await prisma.user.upsert({
            where: { email: insurerData.email },
            update: { password: hashedInsurerPassword },
            create: {
                email: insurerData.email,
                password: hashedInsurerPassword,
                fullName: insurerData.fullName,
                role: "INSURER",
                phone: "+255000000000",
                companyName: insurerData.fullName,
                status: "APPROVED",
            },
        });
        console.log("✅ Insurer created:", insurerData.email);
    }

    // Create Normal User
    const userEmail = "festus@gmail.com";
    const userPassword = "123456";
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);

    await prisma.user.upsert({
        where: { email: userEmail },
        update: { password: hashedUserPassword },
        create: {
            email: userEmail,
            password: hashedUserPassword,
            fullName: "Festus User",
            role: "USER",
            phone: "+255000000000",
            status: "APPROVED",
        },
    });
    console.log("✅ Normal user created:", userEmail);

    // Create Ports - Comprehensive Global Seaports Database
    const ports = [
        // ========== AFRICA ==========

        // Algeria
        { code: "DZALG", name: "Algiers", country: "DZ" },
        { code: "DZORN", name: "Oran", country: "DZ" },
        { code: "DZAAE", name: "Annaba", country: "DZ" },

        // Angola
        { code: "AOLAD", name: "Luanda", country: "AO" },
        { code: "AOLOB", name: "Lobito", country: "AO" },

        // Benin
        { code: "BJCOO", name: "Cotonou", country: "BJ" },

        // Cameroon
        { code: "CMDLA", name: "Douala", country: "CM" },
        { code: "CMKBI", name: "Kribi", country: "CM" },

        // Djibouti
        { code: "DJJIB", name: "Port of Djibouti", country: "DJ" },

        // Egypt
        { code: "EGALY", name: "Alexandria", country: "EG" },
        { code: "EGPSD", name: "Port Said", country: "EG" },
        { code: "EGDAM", name: "Damietta", country: "EG" },
        { code: "EGSUZ", name: "Suez", country: "EG" },

        // Equatorial Guinea
        { code: "GQSSG", name: "Malabo", country: "GQ" },
        { code: "GQBSG", name: "Bata", country: "GQ" },

        // Gabon
        { code: "GALBV", name: "Libreville", country: "GA" },
        { code: "GAPOG", name: "Port-Gentil", country: "GA" },

        // Ghana
        { code: "GHTEM", name: "Tema", country: "GH" },
        { code: "GHTKD", name: "Takoradi", country: "GH" },

        // Ivory Coast
        { code: "CIABJ", name: "Abidjan", country: "CI" },

        // Kenya
        { code: "KEMBA", name: "Mombasa", country: "KE" },

        // Liberia
        { code: "LRMLW", name: "Monrovia", country: "LR" },

        // Libya
        { code: "LYTIP", name: "Tripoli", country: "LY" },
        { code: "LYBEN", name: "Benghazi", country: "LY" },

        // Madagascar
        { code: "MGTMM", name: "Toamasina", country: "MG" },

        // Mauritius
        { code: "MUPLU", name: "Port Louis", country: "MU" },

        // Morocco
        { code: "MATNG", name: "Tanger Med", country: "MA" },
        { code: "MACAS", name: "Casablanca", country: "MA" },

        // Mozambique
        { code: "MZMPM", name: "Maputo", country: "MZ" },
        { code: "MZBEW", name: "Beira", country: "MZ" },
        { code: "MZMCM", name: "Nacala", country: "MZ" },

        // Namibia
        { code: "NAWVB", name: "Walvis Bay", country: "NA" },

        // Nigeria
        { code: "NGLOS", name: "Lagos (Apapa)", country: "NG" },
        { code: "NGTCN", name: "Tin Can Island", country: "NG" },
        { code: "NGPHC", name: "Port Harcourt", country: "NG" },

        // Senegal
        { code: "SNDKR", name: "Dakar", country: "SN" },

        // Seychelles
        { code: "SCVIC", name: "Port Victoria", country: "SC" },

        // Sierra Leone
        { code: "SLFNA", name: "Freetown", country: "SL" },

        // Somalia
        { code: "SOMGQ", name: "Mogadishu", country: "SO" },
        { code: "SOMGQ", name: "Berbera", country: "SO" },

        // South Africa
        { code: "ZADUR", name: "Durban", country: "ZA" },
        { code: "ZACPT", name: "Cape Town", country: "ZA" },
        { code: "ZAPLZ", name: "Port Elizabeth", country: "ZA" },
        { code: "ZARBY", name: "Richards Bay", country: "ZA" },

        // Sudan
        { code: "SDPZU", name: "Port Sudan", country: "SD" },

        // Tanzania
        { code: "TZDAR", name: "Dar es Salaam", country: "TZ" },
        { code: "TZTGT", name: "Tanga", country: "TZ" },
        { code: "TZMYW", name: "Mtwara", country: "TZ" },

        // Togo
        { code: "TGLFW", name: "Lomé", country: "TG" },

        // Tunisia
        { code: "TNTUN", name: "Tunis", country: "TN" },
        { code: "TNSFX", name: "Sfax", country: "TN" },

        // ========== ASIA ==========

        // China
        { code: "CNSHA", name: "Shanghai", country: "CN" },
        { code: "CNSZX", name: "Shenzhen", country: "CN" },
        { code: "CNNGB", name: "Ningbo-Zhoushan", country: "CN" },
        { code: "CNCAN", name: "Guangzhou", country: "CN" },
        { code: "CNTAO", name: "Qingdao", country: "CN" },

        // India
        { code: "INBOM", name: "Mumbai", country: "IN" },
        { code: "INNSA", name: "Jawaharlal Nehru (Nhava Sheva)", country: "IN" },
        { code: "INMAA", name: "Chennai", country: "IN" },
        { code: "INCCU", name: "Kolkata", country: "IN" },

        // Japan
        { code: "JPTYO", name: "Tokyo", country: "JP" },
        { code: "JPYOK", name: "Yokohama", country: "JP" },
        { code: "JPOSA", name: "Osaka", country: "JP" },
        { code: "JPUKB", name: "Kobe", country: "JP" },

        // South Korea
        { code: "KRPUS", name: "Busan", country: "KR" },
        { code: "KRINC", name: "Incheon", country: "KR" },

        // Singapore
        { code: "SGSIN", name: "Port of Singapore", country: "SG" },

        // Malaysia
        { code: "MYPKG", name: "Port Klang", country: "MY" },
        { code: "MYTPP", name: "Tanjung Pelepas", country: "MY" },

        // Indonesia
        { code: "IDJKT", name: "Tanjung Priok (Jakarta)", country: "ID" },
        { code: "IDSUB", name: "Surabaya", country: "ID" },

        // Thailand
        { code: "THLCH", name: "Laem Chabang", country: "TH" },
        { code: "THBKK", name: "Bangkok", country: "TH" },

        // Vietnam
        { code: "VNHPH", name: "Hai Phong", country: "VN" },
        { code: "VNSGN", name: "Ho Chi Minh City", country: "VN" },

        // Philippines
        { code: "PHMNL", name: "Manila", country: "PH" },
        { code: "PHCEB", name: "Cebu", country: "PH" },

        // Pakistan
        { code: "PKKHI", name: "Karachi", country: "PK" },
        { code: "PKQCT", name: "Port Qasim", country: "PK" },

        // Bangladesh
        { code: "BDCGP", name: "Chittagong", country: "BD" },

        // Sri Lanka
        { code: "LKCMB", name: "Colombo", country: "LK" },

        // UAE
        { code: "AEJEA", name: "Jebel Ali", country: "AE" },
        { code: "AEDXB", name: "Port Rashid", country: "AE" },

        // Saudi Arabia
        { code: "SAJED", name: "Jeddah Islamic Port", country: "SA" },
        { code: "SADMM", name: "Dammam", country: "SA" },

        // Qatar
        { code: "QADOH", name: "Hamad Port", country: "QA" },

        // Oman
        { code: "OMSLL", name: "Salalah", country: "OM" },
        { code: "OMSOH", name: "Sohar", country: "OM" },

        // ========== EUROPE ==========

        // Netherlands
        { code: "NLRTM", name: "Rotterdam", country: "NL" },

        // Belgium
        { code: "BEANR", name: "Antwerp", country: "BE" },

        // Germany
        { code: "DEHAM", name: "Hamburg", country: "DE" },
        { code: "DEBRV", name: "Bremerhaven", country: "DE" },

        // France
        { code: "FRMRS", name: "Marseille", country: "FR" },
        { code: "FRLEH", name: "Le Havre", country: "FR" },

        // Spain
        { code: "ESVLC", name: "Valencia", country: "ES" },
        { code: "ESBCN", name: "Barcelona", country: "ES" },
        { code: "ESALG", name: "Algeciras", country: "ES" },

        // Italy
        { code: "ITGOA", name: "Genoa", country: "IT" },
        { code: "ITNAP", name: "Naples", country: "IT" },

        // Greece
        { code: "GRPIR", name: "Piraeus", country: "GR" },

        // UK
        { code: "GBFXT", name: "Felixstowe", country: "GB" },
        { code: "GBSOU", name: "Southampton", country: "GB" },

        // Turkey
        { code: "TRAMB", name: "Ambarli", country: "TR" },
        { code: "TRMER", name: "Mersin", country: "TR" },

        // Portugal
        { code: "PTLIS", name: "Lisbon", country: "PT" },
        { code: "PTSIN", name: "Sines", country: "PT" },

        // Poland
        { code: "PLGDN", name: "Gdansk", country: "PL" },

        // Norway
        { code: "NOOSL", name: "Oslo", country: "NO" },

        // Sweden
        { code: "SEGOT", name: "Gothenburg", country: "SE" },

        // Denmark
        { code: "DKCPH", name: "Copenhagen", country: "DK" },

        // ========== NORTH AMERICA ==========

        // USA
        { code: "USLAX", name: "Los Angeles", country: "US" },
        { code: "USLGB", name: "Long Beach", country: "US" },
        { code: "USNYC", name: "New York/New Jersey", country: "US" },
        { code: "USSAV", name: "Savannah", country: "US" },
        { code: "USHOU", name: "Houston", country: "US" },

        // Canada
        { code: "CAVAN", name: "Vancouver", country: "CA" },
        { code: "CAMTR", name: "Montreal", country: "CA" },
        { code: "CAHAL", name: "Halifax", country: "CA" },

        // Mexico
        { code: "MXZLO", name: "Manzanillo", country: "MX" },
        { code: "MXVER", name: "Veracruz", country: "MX" },
        { code: "MXLZC", name: "Lazaro Cardenas", country: "MX" },

        // Panama
        { code: "PABLB", name: "Balboa", country: "PA" },
        { code: "PAONX", name: "Colon", country: "PA" },

        // ========== SOUTH AMERICA ==========

        // Brazil
        { code: "BRSSZ", name: "Santos", country: "BR" },
        { code: "BRRIO", name: "Rio de Janeiro", country: "BR" },

        // Argentina
        { code: "ARBUE", name: "Buenos Aires", country: "AR" },

        // Chile
        { code: "CLVAP", name: "Valparaíso", country: "CL" },

        // Peru
        { code: "PECLL", name: "Callao", country: "PE" },

        // Colombia
        { code: "COCTG", name: "Cartagena", country: "CO" },

        // Ecuador
        { code: "ECGYE", name: "Guayaquil", country: "EC" },

        // Uruguay
        { code: "UYMVD", name: "Montevideo", country: "UY" },

        // ========== OCEANIA ==========

        // Australia
        { code: "AUMEL", name: "Melbourne", country: "AU" },
        { code: "AUSYD", name: "Sydney", country: "AU" },
        { code: "AUBNE", name: "Brisbane", country: "AU" },
        { code: "AUPER", name: "Fremantle", country: "AU" },

        // New Zealand
        { code: "NZAKL", name: "Auckland", country: "NZ" },
        { code: "NZTRG", name: "Tauranga", country: "NZ" },
    ];

    console.log(`Creating ${ports.length} ports...`);
    for (const port of ports) {
        await prisma.port.upsert({
            where: { code: port.code },
            update: {},
            create: {
                code: port.code,
                name: port.name,
                country: port.country,
                type: port.type || "SEA",
            },
        });
    }

    // Create HS Codes
    const hsCodes = [
        { code: "851712", description: "Telephones for cellular networks or for other wireless networks", category: "Electronics" },
        { code: "851762", description: "Machines for the reception, conversion and transmission or regeneration of voice, images or other data", category: "Electronics" },
        { code: "847130", description: "Portable automatic data processing machines, weighing not more than 10 kg, consisting of at least a central processing unit, a keyboard and a display", category: "Electronics" },
        { code: "870323", description: "Motor cars and other motor vehicles principally designed for the transport of persons", category: "Vehicles" },
        { code: "870421", description: "Motor vehicles for the transport of goods", category: "Vehicles" },
        { code: "940360", description: "Other wooden furniture", category: "Furniture" },
        { code: "940161", description: "Other seats, with wooden frames, upholstered", category: "Furniture" },
        { code: "610910", description: "T-shirts, singlets and other vests, knitted or crocheted, of cotton", category: "Textiles" },
        { code: "620342", description: "Men's or boys' trousers, bib and brace overalls, breeches and shorts", category: "Textiles" },
        { code: "300490", description: "Medicaments (excluding goods of heading 30.02, 30.05 or 30.06) consisting of mixed or unmixed products for therapeutic or prophylactic uses", category: "Pharmaceuticals" },
        { code: "100199", description: "Wheat and meslin", category: "Agriculture" },
        { code: "100630", description: "Semi-milled or wholly milled rice, whether or not polished or glazed", category: "Agriculture" },
        { code: "151190", description: "Palm oil and its fractions, whether or not refined, but not chemically modified", category: "Agriculture" },
        { code: "170199", description: "Cane or beet sugar and chemically pure sucrose, in solid form", category: "Agriculture" },
        { code: "271012", description: "Light oils and preparations", category: "Energy" },
        { code: "271019", description: "Other petroleum oils and oils obtained from bituminous minerals", category: "Energy" },
    ];

    console.log(`Creating ${hsCodes.length} HS codes...`);
    for (const hscode of hsCodes) {
        await prisma.hSCode.upsert({
            where: { code: hscode.code },
            update: {},
            create: {
                code: hscode.code,
                description: hscode.description,
                category: hscode.category,
            },
        });
    }

    // Create Policies
    const policies = [
        {
            name: "Marine Cargo (All Risks)",
            code: "ICC-A-001",
            clauseType: "ICC(A)",
            description: "Coverage for all risks of loss of or damage to the subject-matter insured except as excluded.",
            rate: 0.75,
            minPremium: 50,
            transportModes: ["SEA", "AIR"],
            cargoTypes: ["GENERAL"],
            incoterms: ["CIF", "CIP", "CFR", "CPT"],
        },
        {
            name: "Marine Cargo (Basic Cover)",
            code: "ICC-C-001",
            clauseType: "ICC(C)",
            description: "Coverage for major casualties such as fire, stranding, sinking, collision, etc.",
            rate: 0.45,
            minPremium: 30,
            transportModes: ["SEA"],
            cargoTypes: ["GENERAL", "BULK"],
            incoterms: ["FOB", "CFR"],
        },
        {
            name: "Goods in Transit (Road/Rail)",
            code: "GIT-001",
            clauseType: "GIT",
            description: "Coverage for loss or damage to goods while in transit by road or rail within Tanzania and neighbors.",
            rate: 0.60,
            minPremium: 40,
            transportModes: ["ROAD", "RAIL"],
            cargoTypes: ["GENERAL"],
            incoterms: ["EXW", "DDP", "DAP"],
        }
    ];

    console.log(`Creating ${policies.length} insurance policies...`);
    for (const policy of policies) {
        await prisma.insurancePolicy.upsert({
            where: { code: policy.code },
            update: {},
            create: {
                name: policy.name,
                code: policy.code,
                clauseType: policy.clauseType,
                description: policy.description,
                rate: policy.rate,
                minPremium: policy.minPremium,
                transportModes: policy.transportModes,
                cargoTypes: policy.cargoTypes,
                incoterms: policy.incoterms,
                startDate: new Date(),
                autoInvoice: true,
                autoIssue: true,
            },
        });
    }

    console.log("🎉 Database seeding completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
