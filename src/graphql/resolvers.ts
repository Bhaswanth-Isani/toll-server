import { ApolloError, AuthenticationError } from "apollo-server-core";
import * as bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

import {
	LoginUserInput,
	RegisterUserInput,
	UserOutput,
} from "../types/UserType";
import { User } from "../schema/UserSchema";
import {
	AddAmountInput,
	MongoVehicle,
	RegisterVehicleInput,
} from "../types/VehicleType";
import { Vehicle } from "../schema/VehicleSchema";
import {
	MongoParkingLot,
	MongoToll,
	RegisterParkingLotInput,
	RegisterTollInput,
} from "../types/ParkingType";
import { Toll } from "../schema/TollSchema";
import { authentication } from "../config/authentication";
import { Parking } from "../schema/ParkingSchema";
import { MongoPayment, ParkingPaymentInput } from "../types/PaymentType";
import { Payment } from "../schema/PaymentSchema";

export const resolvers = {
	Query: {
		getUser: async (
			_: any,
			{ input: { token } }: { input: { token: string } }
		): Promise<UserOutput> => {
			const context = await authentication(token);

			if (!context) {
				throw new AuthenticationError("You are not authenticated");
			} else {
				return {
					id: context.id,
					email: context.email,
					fullName: context.fullName,
					token: jsonwebtoken.sign(context.id, process.env.JWT_SECRET!),
				};
			}
		},
		getVehicles: async (
			_: any,
			{ input: { token } }: { input: { token: string } }
		): Promise<MongoVehicle[]> => {
			const context = await authentication(token);

			if (!context) {
				throw new AuthenticationError("You are not authenticated");
			} else {
				const vehicles = (await Vehicle.find({
					user: context.id,
				})) as MongoVehicle[];

				if (vehicles) {
					return vehicles;
				} else {
					throw new ApolloError(
						"Could not find your vehicles",
						"VEHICLES_NOT_FOUND"
					);
				}
			}
		},
		getPayments: async (
			_: any,
			{ input: { token } }: { input: { token: string } }
		): Promise<MongoPayment[]> => {
			const context = await authentication(token);
			console.log("Hello");

			if (!context) {
				throw new AuthenticationError("You are not authenticated");
			} else {
				const vehicles = (await Vehicle.find({
					user: context.id,
				})) as MongoVehicle[];

				if (vehicles) {
					const vehicleIds = vehicles.map((element) => element.id);

					return (await Payment.find({ vehicle: { $in: vehicleIds } }).populate(
						"parking"
					)) as MongoPayment[];
				} else {
					throw new ApolloError("Could not find payments", "PAYMENTS_NOT_FOUNT");
				}
			}
		},
		getParkingLots: async (): Promise<MongoParkingLot[]> => {
			const parkingLots = (await Parking.find({})) as MongoParkingLot[];

			if (parkingLots) {
				return parkingLots;
			} else {
				throw new ApolloError(
					"Could not find parking lots",
					"PARKING_LOTS_NOT_FOUND"
				);
			}
		},
	},
	Mutation: {
		updateBlock: async (
			_: any,
			{ input: { vehicleId } }: { input: { vehicleId: String } }
		) => {
			const vehicle = await Vehicle.findById(vehicleId);
			await Vehicle.findByIdAndUpdate(vehicleId, { block: !vehicle?.block });
			return true;
		},
		updateType: async (
			_: any,
			{ input: { vehicleId } }: { input: { vehicleId: String } }
		) => {
			const vehicle = await Vehicle.findById(vehicleId);
			await Vehicle.findByIdAndUpdate(vehicleId, {
				paymentType: vehicle?.paymentType === "SINGLE" ? "DOUBLE" : "SINGLE",
			});
			return true;
		},
		registerUser: async (
			_: any,
			{ input: { fullName, email, password } }: RegisterUserInput
		): Promise<UserOutput | null> => {
			const userExists = await User.findOne({ email });

			if (userExists) {
				throw new ApolloError(
					"User already exists. Try logging in.",
					"USER_EXISTS"
				);
			}

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			const user = await User.create({
				fullName,
				email,
				password: hashedPassword,
			});

			return user
				? {
						id: user.id,
						fullName: user.fullName,
						email: user.email,
						token: jsonwebtoken.sign(user.id, process.env.JWT_SECRET!),
				  }
				: null;
		},
		loginUser: async (
			_: any,
			{ input: { email, password } }: LoginUserInput
		): Promise<UserOutput> => {
			const user = await User.findOne({ email });

			if (user && (await bcrypt.compare(password, user.password))) {
				return {
					id: user.id,
					fullName: user.fullName,
					email: user.email,
					token: jsonwebtoken.sign(user.id, process.env.JWT_SECRET!),
				};
			} else {
				throw new ApolloError("Invalid Credentials", "INVALID_CREDENTIALS");
			}
		},
		registerVehicle: async (
			_: any,
			{ input: { token, licensePlate, rfid, type } }: RegisterVehicleInput
		): Promise<MongoVehicle> => {
			const context = await authentication(token);

			if (!context) {
				throw new AuthenticationError("You are not authenticated");
			} else {
				const vehicle = await Vehicle.create({
					licensePlate,
					user: context.id,
					rfid,
					type,
				});

				if (vehicle) {
					return {
						id: vehicle.id,
						licensePlate: vehicle.licensePlate as string,
						rfid: vehicle.rfid as string,
						user: vehicle.user as string,
						type: vehicle.type as string,
						paymentType: vehicle.paymentType as string,
						block: vehicle.block as boolean,
						amount: vehicle.amount as number,
					};
				} else {
					throw new ApolloError("Could not create vehicle", "VEHICLE_NOT_CREATED");
				}
			}
		},
		addAmount: async (
			_: any,
			{ input: { token, vehicleId, amount } }: AddAmountInput
		): Promise<MongoVehicle> => {
			const context = await authentication(token);

			if (!context) {
				throw new AuthenticationError("You are not authenticated");
			} else {
				const vehicle = await Vehicle.findById(vehicleId);

				if (vehicle && vehicle.user == context.id) {
					const updatedVehicle = await Vehicle.findByIdAndUpdate(
						vehicleId,
						{
							amount: (vehicle.amount as number) + amount,
						},
						{ new: true }
					);

					if (updatedVehicle) {
						return {
							id: updatedVehicle.id,
							licensePlate: updatedVehicle.licensePlate as string,
							rfid: updatedVehicle.rfid as string,
							user: updatedVehicle.user as string,
							type: vehicle.type as string,
							paymentType: vehicle.paymentType as string,
							block: vehicle.block as boolean,
							amount: updatedVehicle.amount as number,
						};
					} else {
						throw new ApolloError(
							"Could not add amount to your vehicle wallet",
							"AMOUNT_NOT_ADDED"
						);
					}
				} else {
					throw new ApolloError("Could not find your vehicle", "VEHICLE_NOT_FOUND");
				}
			}
		},
		registerToll: async (
			_: any,
			{
				input: { name, doubleTruck, singleCar, singleTruck, doubleCar },
			}: RegisterTollInput
		): Promise<MongoToll> => {
			const parking = await Toll.create({
				name,
				doubleTruck,
				singleCar,
				singleTruck,
				doubleCar,
			});

			if (parking) {
				return {
					id: parking.id,
					name: parking.name,
					doubleCar: parking.doubleCar,
					singleCar: parking.singleCar,
					doubleTruck: parking.doubleTruck,
					singleTruck: parking.singleTruck,
				};
			} else {
				throw new ApolloError(
					"Could not register your parking lot",
					"PARKING_REGISTRATION_FAILED"
				);
			}
		},
		registerParkingLot: async (
			_: any,
			{
				input: { name, parkingCharge, electricityCharge, lots },
			}: RegisterParkingLotInput
		): Promise<MongoParkingLot> => {
			const parking = await Parking.create({
				name,
				parkingCharge,
				electricityCharge,
				lots,
			});

			if (parking) {
				return {
					id: parking.id,
					name: parking.name,
					parkingCharge: parking.parkingCharge,
					electricityCharge: parking.electricityCharge,
					occupied: parking.occupied,
					lots: parking.lots,
				};
			} else {
				throw new ApolloError(
					"Could not register your parking lot",
					"PARKING_REGISTRATION_FAILED"
				);
			}
		},
		parkingPayment: async (
			_: any,
			{ input: { paymentId, token } }: ParkingPaymentInput
		): Promise<{ payment: string }> => {
			const context = await authentication(token);

			if (!context) {
				throw new AuthenticationError("You are not authenticated");
			} else {
				const paymentDetails = await Payment.findById(paymentId);
				const vehicleDetails = await Vehicle.findById(paymentDetails?.vehicle);

				if (paymentDetails && vehicleDetails) {
					if (
						(vehicleDetails.amount as number) >= (paymentDetails.amount as number)
					) {
						const updateVehicle = await Vehicle.findByIdAndUpdate(
							vehicleDetails.id,
							{
								amount:
									(vehicleDetails.amount as number) - (paymentDetails.amount as number),
							},
							{ new: true }
						);

						if (updateVehicle) {
							const updatePayment = await Payment.findByIdAndUpdate(
								paymentDetails.id,
								{ payment: "DONE" },
								{ new: true }
							);

							return updatePayment ? { payment: "DONE" } : { payment: "NOT_DONE" };
						} else {
							throw new ApolloError(
								"Could not initiate payment",
								"PAYMENT_NOT_COMPLETE"
							);
						}
					} else {
						await Payment.findByIdAndUpdate(
							paymentDetails.id,
							{ payment: "CANCELLED" },
							{ new: true }
						);

						return { payment: "CANCELLED" };
					}
				} else {
					throw new ApolloError("Invalid payment details", "INVALID_PAYMENT_ID");
				}
			}
		},
	},
};
