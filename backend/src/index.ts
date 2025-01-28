import express, {Request, Response} from "express";
import { HDNodeWallet } from "ethers6";
import {config} from "./config";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken"
import { mnemonicToSeedSync } from "bip39";
import cors from "cors";
import { auth, ER } from "./auth";

const prisma=new PrismaClient();
const seed=mnemonicToSeedSync(config.MNEMONICS);

const app=express();
app.use(express.json())
app.use(cors());

app.post("/signup", async(req, res)=>{
    const username=req.body.username;
    const password=req.body.password;   
    const result=await prisma.binanceUsers.create({
        data:{
            username,
            password,
            depositAddress:"",
            privateKey:"",
            balance: 0,
        }
    })
    const userId=result.id;
    const hdNode=HDNodeWallet.fromSeed(seed);
    const derivationPath=`m/44'/60'/${userId}'/0`;
    const child=hdNode.derivePath(derivationPath);

    await prisma.binanceUsers.update({
        where:{ id: userId},
        data:{
            depositAddress: child.address.toLowerCase(),
            privateKey: child.privateKey,
        }
    })

    console.log(child.address);
    console.log(child.privateKey);

    console.log(child);
    res.json({
        userId: userId
    })
})

app.post("/signin", async(req: Request, res: Response)=>{
    const {username, password}=req.body;
    const user=await prisma.binanceUsers.findFirst({where: {username, password}})
    if(!user){
        res.json({
            message: "No such user"
        })
        return;
    }
    const token=jwt.sign({userId: user.id}, config.SECRET_KEY);
    res.json({
        token: token
    })
    
})

app.get("/depositAddress/:userId", async(req: Request, res: Response)=>{
    const userId=req.params.userId;
    const user=await prisma.binanceUsers.findUnique({
        where:{id: Number(userId)}
    })

    if(!user){
        res.json({
            message: "User not found"
        })
        return;
    }

    res.json({
        depositAddress: user.depositAddress
    })

})

app.listen(config.PORT)