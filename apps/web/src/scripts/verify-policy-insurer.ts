import { prisma } from '../lib/prisma';

async function main() {
    console.log('Fetching policies with insurer details...');
    try {
        const policies = await prisma.insurancePolicy.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            include: {
                insurer: {
                    select: {
                        id: true,
                        fullName: true,
                        logoUrl: true
                    }
                }
            }
        });

        console.log(`Found ${policies.length} policies.`);

        const policyWithInsurer = policies.find(p => p.insurer);
        if (policyWithInsurer) {
            console.log('Found policy with insurer:', policyWithInsurer.insurer);
        } else {
            console.log('No policies have an insurer assigned.');
            // Log the first one to see what it looks like
            if (policies.length > 0) console.log('Sample policy (no insurer):', policies[0]);
        }
    } catch (error) {
        console.error('Error fetching policies:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
