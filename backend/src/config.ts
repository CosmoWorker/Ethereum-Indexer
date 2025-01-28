import dotenv from "dotenv";
dotenv.config()

type config= Record<"MNEMONICS" | "SECRET_KEY" | "DATABASE_URL"| "PORT", string>

if (!process.env.SECRET_KEY || !process.env.MNEMONICS || !process.env.DATABASE_URL || !process.env.PORT){
    throw new Error("Environment variables might be empty")
}

export const config: config={    
    DATABASE_URL: process.env.DATABASE_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    MNEMONICS: process.env.MNEMONICS,
    PORT: process.env.PORT
}