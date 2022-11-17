export type MongoVehicle = {
    id: string;
    licensePlate: string;
    rfid: string;
    user: string;
    type: string
    paymentType: string;
    block: boolean;
    amount: number;
}

export type RegisterVehicleInput = {
    input: {
        token: string;
        licensePlate: string;
        rfid: string;
        type: string;
    }
}

export type AddAmountInput = {
    input: {
        token: string;
        vehicleId: string;
        amount: number;
    }
}