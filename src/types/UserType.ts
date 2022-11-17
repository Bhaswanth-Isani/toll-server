export type RegisterUserInput = {
    input: {
        fullName: string;
        email: string;
        password: string;
        notification: string;
    }
}

export type LoginUserInput = {
    input: {
        email: string;
        password: string;
        notification: string;
    }
}

export type MongoUser = {
    id: string;
    fullName: string;
    email: string;
    password: string;
}

export type UserOutput = {
    id: string;
    fullName: string;
    email: string;
    token: string;
}