import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken";
import { env } from "../constants/env";

interface TokenPayload {
    id: string,
}

declare global {
    namespace Express {
        interface Request {
            userId?:string;
        }
    }
}

export const requireAuth = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const token = req.headers["authorization"]?.split("Bearer ")?.[1];
        
        if (!token) {
            return res.status(403).json({success:false,message:"Access token required"});
        }

        const decodedToken = jwt.verify(token,env.jwtSecret) as TokenPayload;

        if (!decodedToken || !decodedToken.id) {
            return res.status(403).json({success:false,message:"Invalid token"});
        }

        req.userId = decodedToken.id;
        next();
    } catch (error) {
        return res.status(403).json({success:false,message:"Invalid token"})
    }
}