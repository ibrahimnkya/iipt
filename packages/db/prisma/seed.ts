import { prisma } from "../index";
import bcrypt from "bcryptjs";

async function main() {
    console.log("🌱 Starting database seed...");

    // Create admin user
    const adminEmail = "admin@tiip.co.tz";
    const adminPassword = "Admin@2025";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: hashedPassword,
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

    // Create Ports
    const ports = [
        // Tanzania
        { code: "TZDAR", name: "Dar es Salaam Port", country: "TZ" },
        { code: "TZTGT", name: "Tanga Port", country: "TZ" },
        { code: "TZMYW", name: "Mtwara Port", country: "TZ" },
        { code: "TZZNZ", name: "Zanzibar Port", country: "TZ" },
        { code: "TZJRO", name: "Kilimanjaro Int'l Airport", country: "TZ", type: "AIR" },
        { code: "TZDAR-AIR", name: "Julius Nyerere Int'l Airport", country: "TZ", type: "AIR" },

        // Kenya
        { code: "KEMBA", name: "Mombasa Port", country: "KE" },
        { code: "KENBO", name: "Nairobi ICD", country: "KE", type: "LAND" },

        // China
        { code: "CNSHG", name: "Shanghai Port", country: "CN" },
        { code: "CNNSA", name: "Nansha Port", country: "CN" },
        { code: "CNSZX", name: "Shenzhen Port", country: "CN" },
        { code: "CNHKA", name: "Hong Kong Port", country: "CN" },
        { code: "CNNING", name: "Ningbo-Zhoushan Port", country: "CN" },
        { code: "CNQIN", name: "Qingdao Port", country: "CN" },

        // India
        { code: "INNSA", name: "Nhava Sheva (JNPT)", country: "IN" },
        { code: "INMUN", name: "Mundra Port", country: "IN" },
        { code: "INMAA", name: "Chennai Port", country: "IN" },

        // UAE
        { code: "AEJAB", name: "Jebel Ali Port (Dubai)", country: "AE" },
        { code: "AEAUH", name: "Khalifa Port (Abu Dhabi)", country: "AE" },

        // South Africa
        { code: "ZADUR", name: "Durban Port", country: "ZA" },
        { code: "ZACPT", name: "Cape Town Port", country: "ZA" },

        // USA
        { code: "USNYC", name: "Port of New York and New Jersey", country: "US" },
        { code: "USLAX", name: "Port of Los Angeles", country: "US" },

        // UK
        { code: "GBFXT", name: "Port of Felixstowe", country: "GB" },
        { code: "GBSOU", name: "Port of Southampton", country: "GB" },

        // Japan
        { code: "JPTYO", name: "Port of Tokyo", country: "JP" },
        { code: "JPYOK", name: "Port of Yokohama", country: "JP" },
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
