import express from "express";
import expressAsyncHandler from "express-async-handler";

import { Vehicle } from "../schema/VehicleSchema";
import { Toll } from "../schema/TollSchema";
import { Payment } from "../schema/PaymentSchema";
import { Parking } from "../schema/ParkingSchema";
import { User } from "../schema/UserSchema";

export const paymentRoute = express.Router();

const addPayment = expressAsyncHandler(async (req: any, res) => {
	const { rfid, parkingId } = req.body;

	if (!rfid || !parkingId) {
		res.status(400);
		throw new Error("Please add all fields");
	}

	const vehicle = await Vehicle.findOne({ rfid });
	const parking = await Toll.findById(parkingId);

	let payment;

	if (vehicle && parking) {
		if (!vehicle.block) {
			if (vehicle.type === "Car") {
				if (vehicle.paymentType === "SINGLE") {
					payment = await Vehicle.findByIdAndUpdate(
						vehicle.id,
						{ amount: (vehicle.amount as number) - (parking.singleCar as number) },
						{ new: true }
					);

					res.status(200).json({
						payment: payment ? "DONE" : "FAILED",
					});
				} else {
					payment = await Vehicle.findByIdAndUpdate(
						vehicle.id,
						{ amount: (vehicle.amount as number) - (parking.doubleCar as number) },
						{ new: true }
					);

					res.status(200).json({
						payment: payment ? "DONE" : "FAILED",
					});
				}
			} else {
				if (vehicle.paymentType === "SINGLE") {
					payment = await Vehicle.findByIdAndUpdate(
						vehicle.id,
						{ amount: (vehicle.amount as number) - (parking.singleTruck as number) },
						{ new: true }
					);

					res.status(200).json({
						payment: payment ? "DONE" : "FAILED",
					});
				} else {
					payment = await Vehicle.findByIdAndUpdate(
						vehicle.id,
						{ amount: (vehicle.amount as number) - (parking.doubleTruck as number) },
						{ new: true }
					);

					res.status(200).json({
						payment: payment ? "DONE" : "FAILED",
					});
				}
			}
		} else {
			res.status(200).json({
				payment: "FAILED",
			});
		}
	} else {
		res.status(200).json({
			payment: "FAILED",
		});
	}
});

const addPaymentParking = expressAsyncHandler(async (req: any, res) => {
	const { rfid, parkingId } = req.body;

	if (!rfid || !parkingId) {
		res.status(400);
		throw new Error("Please add all fields");
	}

	const vehicle = await Vehicle.findOne({ rfid });
	const parking = await Parking.findById(parkingId);
	const payment = await Payment.findOne({
		$and: [{ active: true }, { vehicle: vehicle?.id }, { parking: parking?.id }],
	});
	const user = await User.findById(vehicle?.user);

	if (vehicle && parking && payment !== null) {
		if (payment.payment === "NOTHING") {
			const updatePayment: any = await Payment.findByIdAndUpdate(
				payment.id,
				{ payment: "INITIATED" },
				{ new: true }
			);

			if (updatePayment) {
				await Parking.findByIdAndUpdate(
					parking.id,
					{ occupied: parking.occupied - 1 },
					{ new: true }
				);

				const time =
					(new Date(updatePayment.updatedAt).getTime() -
						new Date(updatePayment.createdAt).getTime()) /
					(1000 * 60);

				const amountToBePaid = Math.ceil(time * parking.parkingCharge);

				const updatePaymentAmount = await Payment.findByIdAndUpdate(
					payment.id,
					{ amount: amountToBePaid },
					{ new: true }
				).populate("parking");

				if (updatePaymentAmount) {
					const payload = {
						notification: {
							title: "Parking Payment Pending",
							body: "Parking Payment: " + parking.name,
							click_action: "FLUTTER_NOTIFICATION_CLICK",
						},
						data: {
							paymentId: updatePaymentAmount.id,
							amount: (updatePaymentAmount.amount as number).toString(),
						},
					};

					res.status(201);
					res.json({
						reply: updatePaymentAmount.payment,
						updated: true,
						exit: true,
					});
				}
			}
		} else if (payment.payment === "DONE") {
			await Payment.findByIdAndUpdate(
				payment.id,
				{ active: false },
				{ new: true }
			);
			res.status(201);
			res.json({
				reply: "DONE",
				updated: true,
				exit: true,
			});
		} else {
			// For "CANCELED" and "INITIATED" payment types
			res.status(201);
			res.json({
				reply: payment.payment,
				updated: true,
				exit: true,
			});
		}
	} else if (!payment && vehicle && parking) {
		await Payment.create({
			vehicle: vehicle.id,
			parking: parking.id,
			active: true,
		});
		await Parking.findByIdAndUpdate(
			parking.id,
			{ occupied: parking.occupied + 1 },
			{ new: true }
		);

		res.json({
			reply: "NOTHING",
			updated: true,
			exit: false,
		});
	} else {
		res.status(400);
		throw new Error("Invalid data");
	}
});

paymentRoute.post("/toll", addPayment);
paymentRoute.post("/", addPaymentParking);
