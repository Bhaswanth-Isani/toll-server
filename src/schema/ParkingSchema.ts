import mongoose from "mongoose";

const parkingSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	parkingCharge: {
		type: Number,
		required: true,
	},
	electricityCharge: {
		type: Number,
		required: true,
	},
    occupied: {
        type: Number,
        required: true,
        default: 0
    },
	lots: {
		type: Number,
		required: true,
		default: 2,
	},
});

export const Parking = mongoose.model("Parking", parkingSchema);
