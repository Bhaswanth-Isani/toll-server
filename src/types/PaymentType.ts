export type MongoPayment = {
    vehicle: string;
    parking: string;
    active: boolean;
    payment: "NOTHING" | "INITIATED" | "DONE" | "CANCELLED";
    amount: number;
    pastCharge: number;
    createdAt: string;
    updatedAt: string;
}

export type ParkingPaymentInput = {
    input: {
        token: string;
        paymentId: string;
    }
}