import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    licensePlate: {
        type: String,
        required: true,
        unique: true,
    },
    rfid: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    type: {
        type: String,
        required: true,
    },
    paymentType: {
        type: String,
        default: "SINGLE"
    },
    block: {
        type: mongoose.Schema.Types.Boolean,
        default: false,
    },
    amount: {
        type: Number,
        default: 0,
    }
});

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);