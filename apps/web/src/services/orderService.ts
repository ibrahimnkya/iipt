import { prisma } from "@tiips/db";
import { InvoiceService } from "./invoiceService";

interface CreateOrderInput {
    userId: string;
    policyId: string;
    incoterm: string;
    incotermOther?: string;
    cargoDescription: string;
    cargoNature: string;
    packagingMethod: string;
    packagingMethodOther?: string;
    weightUnit: string;
    totalWeight: string;
    originPort: string;
    destinationPort: string;
    originCountry: string;
    destinationCountry: string;
    transportMode: string;
    dispatchDate: Date;
    transShipment: boolean;
    transShipmentNote?: string;
    vesselName?: string;
    carrierName?: string;
    invoiceValue: number;
    currency: string;
    valuationBasis: string;
    valuationBasisOther?: string;
    sumInsured: number;
    storageRequired: boolean;
    storageLocation?: string;
    storageDuration?: string;
    claimsHistory: boolean;
    claimsDetails?: string;
    proposerName: string;
    proposerCapacity: string;
    proposerCapacityOther?: string;
    coverType: string;
    additionalCovers?: string;
    declarationDate: Date;
    acceptTerms: boolean;
}

export class OrderService {
    /**
     * Create a new order and automatically generate invoice
     */
    static async createOrder(input: CreateOrderInput) {
        // Get policy to calculate invoice
        const policy = await prisma.insurancePolicy.findUnique({
            where: { id: input.policyId },
        });

        if (!policy) {
            throw new Error("Insurance policy not found");
        }

        if (!policy.isActive) {
            throw new Error("Insurance policy is not active");
        }

        // Create order
        const order = await prisma.order.create({
            data: {
                userId: input.userId,
                policyId: input.policyId,
                status: "PENDING",
                validationStatus: "HOLD",
                incoterm: input.incoterm,
                incotermOther: input.incotermOther,
                cargoDescription: input.cargoDescription,
                cargoNature: input.cargoNature,
                packagingMethod: input.packagingMethod,
                packagingMethodOther: input.packagingMethodOther,
                weightUnit: input.weightUnit,
                totalWeight: input.totalWeight,
                originPort: input.originPort,
                destinationPort: input.destinationPort,
                originCountry: input.originCountry,
                destinationCountry: input.destinationCountry,
                transportMode: input.transportMode,
                dispatchDate: input.dispatchDate,
                transShipment: input.transShipment,
                transShipmentNote: input.transShipmentNote,
                vesselName: input.vesselName,
                carrierName: input.carrierName,
                invoiceValue: input.invoiceValue,
                currency: input.currency,
                valuationBasis: input.valuationBasis,
                valuationBasisOther: input.valuationBasisOther,
                sumInsured: input.sumInsured,
                storageRequired: input.storageRequired,
                storageLocation: input.storageLocation,
                storageDuration: input.storageDuration,
                claimsHistory: input.claimsHistory,
                claimsDetails: input.claimsDetails,
                proposerName: input.proposerName,
                proposerCapacity: input.proposerCapacity,
                proposerCapacityOther: input.proposerCapacityOther,
                coverType: input.coverType,
                additionalCovers: input.additionalCovers,
                declarationDate: input.declarationDate,
                acceptTerms: input.acceptTerms,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
                policy: true,
            },
        });

        // Automatically create invoice
        const { invoice, calculation } = await InvoiceService.createInvoice({
            orderId: order.id,
            sumInsured: input.sumInsured,
            policyRate: policy.rate,
        });

        return {
            order,
            invoice,
            calculation,
        };
    }

    /**
     * Get order by ID
     */
    static async getOrderById(orderId: string) {
        return await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        phone: true,
                    },
                },
                policy: true,
                invoice: {
                    include: {
                        payments: true,
                    },
                },
            },
        });
    }

    /**
     * Get all orders for a user
     */
    static async getUserOrders(userId: string) {
        return await prisma.order.findMany({
            where: { userId },
            include: {
                policy: true,
                invoice: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    /**
     * Get all orders (admin only)
     */
    static async getAllOrders() {
        return await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
                policy: true,
                invoice: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    /**
     * Update order status (admin only)
     */
    static async updateOrderStatus(
        orderId: string,
        status: "PENDING" | "APPROVED" | "ISSUED" | "CANCELLED"
    ) {
        return await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
                policy: true,
                invoice: true,
            },
        });
    }
}
