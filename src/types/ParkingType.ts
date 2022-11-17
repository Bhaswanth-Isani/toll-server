export type MongoToll = {
    id: string;
    name: string;
    singleCar: number;
    doubleCar: number;
    singleTruck: number;
    doubleTruck: number;
}

export type RegisterTollInput = {
    input: {
        name: string;
        singleCar: number;
        doubleCar: number;
        singleTruck: number;
        doubleTruck: number;
    }
}

export type MongoParkingLot = {
    id: string;
    name: string;
    parkingCharge: number;
    electricityCharge: number;
    occupied: number;
    lots: number;
}

export type RegisterParkingLotInput = {
    input: {
        name: string;
        parkingCharge: number;
        electricityCharge: number;
        occupied: number;
        lots: number;
    }
}