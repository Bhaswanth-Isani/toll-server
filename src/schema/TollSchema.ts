import mongoose from "mongoose";

const tollSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    singleCar: {
        type: Number,
        required: true,
    },
    doubleCar: {
        type: Number,
        required: true,
    },
    singleTruck: {
        type: Number,
        required: true,
    },
    doubleTruck: {
        type: Number,
        required: true,
    },
});

export const Toll = mongoose.model("Toll", tollSchema);