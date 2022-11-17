import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Vehicle",
    },
    parking: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Parking",
    },
    active: { // To know if the vehicle is still parked at the parking lot.
        type: mongoose.Schema.Types.Boolean,
        required: true,
        default: true,
    },
    payment: { // To know if the payment for parking and charging is done.
        type: String,
        required: true,
        default: "NOTHING",
        enum: ["NOTHING", "INITIATED", "DONE", "CANCELLED"]
    },
    amount: { // To know how much the vehicle charged. CurrentCharge - PastCharge.
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
}, {
    timestamps: true,
});

export const Payment = mongoose.model("Payment", paymentSchema);