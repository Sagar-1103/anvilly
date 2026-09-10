import { createClient } from "redis";
import { env } from "../constants/env";

export const redisClient = createClient({
    url: env.redisUrl,
});

export const connectRedis = async() => {
    (await redisClient.connect()).on("error",(error)=>{
        console.log("REDIS ERROR: ",error);
    });
}

export const storeInRedis = async(key:string,data:any) => {
    try {
        await redisClient.set(key,JSON.stringify(data),{expiration:{type:"EX",value:env.redisTtl}});
    } catch (error) {
        console.error("REDIS SET ERROR:", error);
    }
}