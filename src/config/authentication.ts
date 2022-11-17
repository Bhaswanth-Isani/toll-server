import * as jwt from "jsonwebtoken";

import {User} from "../schema/UserSchema";
import {MongoUser} from "../types/UserType";

export const authentication = async (token: string): Promise<MongoUser | null> => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return await User.findById(decoded).select("-password -__v") as MongoUser | null;
};