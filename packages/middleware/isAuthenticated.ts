import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken"
import { UserModel } from "../libs/prisma";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1];

        if (!token) return res.status(401).json({ message: "Unauthorized! Token Missing!" });

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as { id: string; role: "User" | "Seller" };

        if (!decoded) return res.status(401).json({ message: "Unauthorized! Invalid Token!" });

        const account = await UserModel.findById(decoded.id);

        if (!account) return res.status(401).json({ message: "Account not Found!" });

        req.user = account;

        return next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid Token!" });
    }
}

export default isAuthenticated