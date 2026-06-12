
import { prisma } from '../lib/prisma';
import { Role, UserStatus } from '@tiips/db';

async function main() {
    console.log('Seeding Insurer and linking to Policy...');
    try {
        // 1. Find or Create an Insurer
        let insurer = await prisma.user.findFirst({
            where: { role: Role.INSURER }
        });

        if (!insurer) {
            console.log('No insurer found. Creating one...');
            insurer = await prisma.user.create({
                data: {
                    fullName: 'Jubilee Insurance',
                    email: 'jubilee@test.com',
                    password: 'password123', // In real app, hash this
                    role: Role.INSURER,
                    status: UserStatus.APPROVED,
                    phone: '1234567890',
                    tinNumber: '123-456-789',
                    companyName: 'Jubilee Insurance Ltd',
                    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg'
                }
            });
            console.log('Created Insurer:', insurer.id);
        } else {
            console.log('Found Insurer:', insurer.id);
        }

        // 2. Assign to a Policy
        const policy = await prisma.insurancePolicy.findFirst();
        if (policy) {
            await prisma.insurancePolicy.update({
                where: { id: policy.id },
                data: { insurerId: insurer.id }
            });
            console.log(`Updated Policy ${policy.id} with Insurer ${insurer.id}`);
        } else {
            console.log('No policies found to update.');
        }

    } catch (error) {
        console.error('Error seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
