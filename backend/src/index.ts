import express, {Request, Response} from "express";
import { HDNodeWallet } from "ethers6";
import { MNEMONICS } from "./config";
import { PrismaClient } from "@prisma/client";
import { mnemonicToSeedSync } from "bip39";
import cors from "cors";

const prisma=new PrismaClient();
const seed=mnemonicToSeedSync(MNEMONICS);

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
            depositAddress: child.address,
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

app.get("/depositAddress/:userId", async(req: Request, res: Response)=>{
    const userId=parseInt(req.params.userId);
    const user=await prisma.binanceUsers.findUnique({
        where:{id: userId}
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

app.listen(3000)