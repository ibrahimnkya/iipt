import QRCode from "qrcode";

// Define interfaces based on Prisma schema (simplified for frontend use)
// In a real app, these would come from @tiips/types or similar
interface Order {
    id: string;
    sadNumber?: string | null;
    hsCode?: string | null;
    cargoDescription: string;
    incoterm: string;
    originPort: string;
    destinationPort: string;
    invoiceValue: number;
    currency: string;
    sumInsured: number;
    status: string;
    createdAt: string | Date;
    user?: {
        fullName: string;
        email: string;
        phone: string;
        tinNumber?: string | null;
    };
    policy?: {
        name: string;
        code: string;
        insurer?: {
            id: string;
            fullName: string;
            companyName: string | null;
            logoUrl: string | null;
            email: string;
            phone: string;
            physicalAddress: string | null;
            postalAddress: string | null;
        } | null;
    };
}

interface Invoice {
    id: string;
    amount: number;
    currency: string;
    status: string;
    issuedAt: string | Date;
    paidAt?: string | Date | null;
    order?: Order;
}

interface Payment {
    id: string;
    amount: number;
    provider: string;
    status: string;
    transactionId?: string | null;
    createdAt: string | Date;
    phoneNumber: string;
}

export class PdfGenerator {
    private static COMPANY_INFO = {
        name: "NIIS-T - National Import Insurance System – Tanzania",
        orginalName: "FrontLenders",
        address: "Dar es Salaam, Tanzania",
        phone: "+255 772 193 600",
        email: "support@niip.co.tz",
        website: "https://niip.co.tz"
    };

    private static formatDate(date: string | Date): string {
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    private static formatCurrency(amount: number, currency: string): string {
        return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: currency }).format(amount);
    }

    private static async getJsPDF() {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;
        return { jsPDF, autoTable };
    }

    private static addHeader(doc: any, title: string, companyInfo?: any) {
        const pageWidth = doc.internal.pageSize.width;

        // Default Company Info
        const info = companyInfo || this.COMPANY_INFO;

        // Logo Placeholder (Using Text for now)
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(46, 125, 50); // Brand Green
        if (info.companyName) {
            doc.text(info.companyName, 14, 20);
        } else {
            doc.text(this.COMPANY_INFO.orginalName, 14, 20);
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text("Insurance Portal", 14, 25);

        // Company Details (Right Aligned)
        doc.setFontSize(9);
        const address = info.physicalAddress || info.address || this.COMPANY_INFO.address;
        const phone = info.phone || this.COMPANY_INFO.phone;
        const email = info.email || this.COMPANY_INFO.email;
        // Website might not be available on insurer object, fallback to default or omit
        const website = this.COMPANY_INFO.website;

        doc.text(address, pageWidth - 14, 15, { align: "right" });
        doc.text(phone, pageWidth - 14, 20, { align: "right" });
        doc.text(email, pageWidth - 14, 25, { align: "right" });
        doc.text(website, pageWidth - 14, 30, { align: "right" });

        // Line Divider
        doc.setDrawColor(200);
        doc.line(14, 35, pageWidth - 14, 35);

        // Title
        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), 14, 50);
    }

    private static addFooter(doc: any) {
        const pageCount = doc.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);

            // Powered by NIIS-T
            doc.text("Powered by NIIS-T", 14, pageHeight - 10);

            doc.text(
                `Generated on ${new Date().toLocaleString()}`,
                pageWidth / 2, // Center align roughly
                pageHeight - 10,
                { align: "center" }
            );

            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth - 14,
                pageHeight - 10,
                { align: "right" }
            );
        }
    }

    /**
     * Generate QR Code Data URL
     */
    private static async generateQRCode(text: string): Promise<string> {
        try {
            return await QRCode.toDataURL(text, {
                errorCorrectionLevel: 'M',
                margin: 1,
                width: 100,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
        } catch (err) {
            console.error("Error generating QR code", err);
            return "";
        }
    }

    /**
     * Generate Payment Receipt
     */
    static async generateReceipt(invoice: Invoice, payment: Payment) {
        const { jsPDF, autoTable } = await this.getJsPDF();
        const doc = new jsPDF();
        this.addHeader(doc, "Payment Receipt");

        const startY = 60;
        const pageWidth = doc.internal.pageSize.width;

        // Add QR Code
        const qrCodeData = await this.generateQRCode(`https://niip.co.tz/verify/receipt/${payment.id}`);
        if (qrCodeData) {
            doc.addImage(qrCodeData, 'PNG', pageWidth - 40, 15, 25, 25);
        }

        // Payment Details Table
        autoTable(doc, {
            startY: startY,
            head: [['Receipt Details', '']],
            body: [
                ['Receipt No', `#${payment.id.slice(0, 8).toUpperCase()}`],
                ['Transaction ID', payment.transactionId || 'N/A'],
                ['Date', this.formatDate(payment.createdAt)],
                ['Payment Method', payment.provider.toUpperCase()],
                ['Payer Contact', payment.phoneNumber],
                ['Payment Status', payment.status.toUpperCase()]
            ],
            theme: 'striped',
            headStyles: { fillColor: [46, 125, 50] },
            styles: { fontSize: 10, cellPadding: 5 }
        });

        // Invoice Reference
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Invoice Reference', '']],
            body: [
                ['Invoice No', `#${invoice.id.slice(0, 8).toUpperCase()}`],
                ['Invoice Amount', this.formatCurrency(invoice.amount, invoice.currency)],
                ['Amount Paid', this.formatCurrency(payment.amount, invoice.currency)], // Assuming same currency 
            ],
            theme: 'grid',
            headStyles: { fillColor: [100, 100, 100] },
        });

        // Total Paid
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL PAID: ${this.formatCurrency(payment.amount, invoice.currency)}`, 14, finalY);

        this.addFooter(doc);
        doc.save(`Receipt_${payment.id.slice(0, 8)}.pdf`);
    }

    /**
     * Generate Invoice
     */
    static async generateInvoice(invoice: Invoice, order: Order) {
        const { jsPDF, autoTable } = await this.getJsPDF();
        const doc = new jsPDF();

        // Pass insurer info if available
        this.addHeader(doc, "Tax Invoice", order.policy?.insurer);

        const startY = 60;
        const pageWidth = doc.internal.pageSize.width;

        // Add QR Code
        const qrCodeData = await this.generateQRCode(`https://niip.co.tz/verify/invoice/${invoice.id}`);
        if (qrCodeData) {
            doc.addImage(qrCodeData, 'PNG', pageWidth - 40, 15, 25, 25);
        }

        // Bill To
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("BILL TO:", 14, startY);
        doc.setFont("helvetica", "normal");

        let clientY = startY + 5;
        if (order.user) {
            doc.text(order.user.fullName, 14, clientY);
            doc.text(order.user.email, 14, clientY + 5);
            doc.text(order.user.phone, 14, clientY + 10);
            if (order.user.tinNumber) doc.text(`TIN: ${order.user.tinNumber}`, 14, clientY + 15);
        } else {
            doc.text("Valued Customer", 14, clientY);
        }

        // Invoice Details (Right Side)
        doc.setFont("helvetica", "bold");
        doc.text("INVOICE DETAILS:", pageWidth - 80, startY);
        doc.setFont("helvetica", "normal");
        doc.text(`Invoice No: #${invoice.id.slice(0, 8).toUpperCase()}`, pageWidth - 80, startY + 5);
        doc.text(`Date Issued: ${this.formatDate(invoice.issuedAt)}`, pageWidth - 80, startY + 10);
        doc.text(`Status: ${invoice.status}`, pageWidth - 80, startY + 15);
        if (invoice.paidAt) {
            doc.text(`Paid Date: ${this.formatDate(invoice.paidAt)}`, pageWidth - 80, startY + 20);
        }

        // Items Table
        autoTable(doc, {
            startY: startY + 30,
            head: [['Description', 'Reference', 'Amount']],
            body: [
                [
                    `Marine Cargo Insurance Premium\nPolicy: ${order.policy?.name || 'N/A'}\nCargo: ${order.cargoDescription}`,
                    `Order #${order.id.slice(0, 8)}`,
                    this.formatCurrency(invoice.amount, invoice.currency)
                ]
            ],
            theme: 'striped',
            headStyles: { fillColor: [46, 125, 50] },
            columnStyles: {
                2: { halign: 'right' }
            }
        });

        // Totals
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        const rightAlign = pageWidth - 14;

        doc.text(`Subtotal:`, rightAlign - 50, finalY);
        doc.text(`${this.formatCurrency(invoice.amount, invoice.currency)}`, rightAlign, finalY, { align: "right" });

        doc.setFont("helvetica", "bold");
        doc.text(`TOTAL:`, rightAlign - 50, finalY + 10);
        doc.text(`${this.formatCurrency(invoice.amount, invoice.currency)}`, rightAlign, finalY + 10, { align: "right" });

        this.addFooter(doc);
        doc.save(`Invoice_${invoice.id.slice(0, 8)}.pdf`);
    }

    /**
     * Generate Order Summary
     */
    static async generateOrderSummary(order: Order) {
        const { jsPDF, autoTable } = await this.getJsPDF();
        const doc = new jsPDF();
        this.addHeader(doc, "Order Summary", order.policy?.insurer);

        const startY = 60;
        const pageWidth = doc.internal.pageSize.width;

        // Add QR Code
        const qrCodeData = await this.generateQRCode(`https://niip.co.tz/verify/order/${order.id}`);
        if (qrCodeData) {
            doc.addImage(qrCodeData, 'PNG', pageWidth - 40, 15, 25, 25);
        }

        // Order Info
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`Order #${order.id.slice(0, 8).toUpperCase()}`, 14, startY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Created: ${this.formatDate(order.createdAt)}`, 14, startY + 5);
        doc.text(`Status: ${order.status}`, 14, startY + 10);

        // Insurance Details
        autoTable(doc, {
            startY: startY + 20,
            head: [['Insurance Details', '']],
            body: [
                ['Policy Type', order.policy?.name || 'N/A'],
                ['SAD Number', order.sadNumber || 'N/A'],
                ['HS Code', order.hsCode || 'N/A'],
                ['Incoterm', order.incoterm],
                ['Sum Insured', this.formatCurrency(order.sumInsured, order.currency)],
            ],
            theme: 'striped',
            headStyles: { fillColor: [66, 66, 66] }
        });

        // Cargo & Shipment Details
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [['Shipment Details', '']],
            body: [
                ['Cargo Description', order.cargoDescription],
                ['Origin Port', order.originPort],
                ['Destination Port', order.destinationPort],
                ['Invoice Value', this.formatCurrency(order.invoiceValue, order.currency)],
            ],
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }
        });

        // Applicant Details
        if (order.user) {
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 10,
                head: [['Applicant', '']],
                body: [
                    ['Name', order.user.fullName],
                    ['Email', order.user.email],
                    ['Phone', order.user.phone],
                    ['TIN', order.user.tinNumber || 'N/A'],
                ],
                theme: 'plain',
            });
        }

        this.addFooter(doc);
        doc.save(`Order_${order.id.slice(0, 8)}.pdf`);
    }
}
