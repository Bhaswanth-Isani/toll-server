import { gql } from "apollo-server-core";

export const typeDefs = gql`
	type UserOutput {
		id: ID!
		fullName: String!
		email: String!
		token: String!
	}

	type VehicleOutput {
		id: ID!
		licensePlate: String!
		rfid: String!
		user: String!
		type: String!
		paymentType: String!
		block: Boolean!
		amount: Int!
	}

	type TollOutput {
		id: ID!
		name: String!
		singleCar: Int!
		doubleCar: Int!
		singleTruck: Int!
		doubleTruck: Int!
	}

	input RegisterUserInput {
		fullName: String!
		email: String!
		password: String!
	}

	input LoginUserInput {
		email: String!
		password: String!
	}

	type ParkingPaymentOutput {
		payment: String!
	}

	type PaymentOutput {
		id: ID!
		vehicle: String!
		parking: ParkingLotOutput!
		active: Boolean!
		payment: String!
		amount: Int!
		createdAt: String!
		updatedAt: String!
	}

    type ParkingLotOutput {
        id: ID!
        name: String!
        parkingCharge: Int!
        electricityCharge: Int!
        occupied: Int!
        lots: Int!
    }

	input RegisterVehicleInput {
		token: String!
		licensePlate: String!
		rfid: String!
		type: String!
	}

	input AddAmountInput {
		token: String!
		vehicleId: ID!
		amount: Int!
	}

	input RegisterTollInput {
		name: String!
		singleCar: Int!
		doubleCar: Int!
		singleTruck: Int!
		doubleTruck: Int!
	}

	input RegisterParkingLotInput {
		name: String!
		parkingCharge: Int!
		electricityCharge: Int!
		lots: Int!
	}

	input ParkingPaymentInput {
		token: String!
		paymentId: ID!
	}

	input UserIDInput {
		token: String!
	}

	input VehicleInput {
		vehicleId: ID!
	}

	type Query {
		getUser(input: UserIDInput!): UserOutput!
		getVehicles(input: UserIDInput!): [VehicleOutput]!
		getPayments(input: UserIDInput!): [PaymentOutput]!
		getParkingLots: [ParkingLotOutput]!
	}

	type Mutation {
		updateBlock(input: VehicleInput!): Boolean!
		updateType(input: VehicleInput!): Boolean!
		registerUser(input: RegisterUserInput!): UserOutput!
		loginUser(input: LoginUserInput!): UserOutput!
		registerVehicle(input: RegisterVehicleInput!): VehicleOutput!
		addAmount(input: AddAmountInput!): VehicleOutput!
		registerParkingLot(input: RegisterParkingLotInput!): ParkingLotOutput!
		parkingPayment(input: ParkingPaymentInput!): ParkingPaymentOutput!
		registerToll(input: RegisterTollInput!): TollOutput!
	}
`;
