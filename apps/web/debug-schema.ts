
import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:tiips@localhost:5433/tiips_db?schema=public';

async function main() {
    console.log(`Connecting to: ${connectionString.replace(/:[^:]+@/, ':****@')}`);
    const client = new Client({ connectionString });

    try {
        await client.connect();

        // List all tables
        console.log("\n--- Tables in public schema ---");
        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        tablesRes.rows.forEach(row => console.log(`- ${row.table_name}`));

        // List columns for Order table (checking case sensitivity variants)
        const variants = ['Order', 'order', 'Orders', 'orders'];

        for (const tableName of variants) {
            console.log(`\n--- Columns for table '${tableName}' ---`);
            const columnsRes = await client.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = $1
                ORDER BY column_name;
            `, [tableName]);

            if (columnsRes.rows.length === 0) {
                console.log(`(No columns found or table does not exist)`);
            } else {
                columnsRes.rows.forEach(row => {
                    console.log(`  ${row.column_name} (${row.data_type}, ${row.is_nullable})`);
                });
            }
        }

    } catch (err: any) {
        console.error("Database connection error:", err.message);
    } finally {
        await client.end();
    }
}

main();
