
import { Client } from 'pg';

async function checkDatabase(dbName: string, connectionString: string) {
    console.log(`\nChecking database: ${dbName}`);
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Order' AND column_name = 'valuationBasisOther';
        `);

        if (res.rows.length > 0) {
            console.log(`✅ Column 'valuationBasisOther' FOUND in table 'Order' for ${dbName}`);
        } else {
            console.log(`❌ Column 'valuationBasisOther' MISSING in table 'Order' for ${dbName}`);
        }
    } catch (err: any) {
        console.error(`Error connecting to ${dbName}:`, err.message);
    } finally {
        await client.end();
    }
}

async function main() {
    // Check tiips_db (what packages/db/.env uses)
    await checkDatabase('tiips_db', 'postgresql://postgres:tiips@localhost:5433/tiips_db?schema=public');

    // Check tiips (what apps/web/.env.local USED to use)
    await checkDatabase('tiips', 'postgresql://postgres:tiips@localhost:5433/tiips?schema=public');
}

main();
