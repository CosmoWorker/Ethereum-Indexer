import axios from 'axios';
import dotenv from "dotenv";
import {PrismaClient} from "../../backend/node_modules/@prisma/client/default"
dotenv.config()
let CURRENT_BLOCK_NUMBER=21709134;
const etherUnit=Math.pow(10,18); //1 ether = 10^18 wei 
const prisma=new PrismaClient();

async function main(op: string){
    //getting interested addresses from the DB
    const userAddresses=await prisma.binanceUsers.findMany({
        select: {depositAddress: true}
    })
    // const interestedAddress=["0x68c905040BcA2Ed08223621b1305E61CB83a5192", "0x870248D3d08A422006813909694cE6deCF27f2b8", "0x72bB98f9de3FA19614375D860bD3973e44dAB3B8"]
    const interestedAddress = userAddresses.map(x=> x.depositAddress.toLowerCase);
    const HEX_CURRENT_BLOCKNO="0x"+CURRENT_BLOCK_NUMBER.toString(16);
    const req1_block=await fetchRequest1(HEX_CURRENT_BLOCKNO);
    const req2_block=await fetchRequest2(HEX_CURRENT_BLOCKNO);
    if(!req1_block || !req2_block){
        console.log("Either block requests's not found");
        return;
    }
    if (req1_block.result.transactions.length === 0 || req2_block.result.transactions.length===0) {
        console.log("No transactions in either or both block");
        return;
    }
    //updating balance
    if(req1_block===req2_block){
        for(const txn of req1_block.result.transactions){
            if(op==="deposit"&&interestedAddress.includes(txn.to)){
                await prisma.binanceUsers.update({
                    where:{depositAddress: txn.to},
                    data:{
                        balance: {
                            increment: parseInt(txn.value, 16)/etherUnit
                        }
                    }
                })
            }
            if(op==="withdraw"&& interestedAddress.includes(txn.from)){
                await prisma.binanceUsers.update({
                    where:{depositAddress: txn.from},
                    data:{
                        balance: {
                            decrement: parseInt(txn.value, 16)/etherUnit
                        }
                    }
                })
            }
        }
    }
}

async function fetchRequest1(blockNumber: string){
    const body={
        "id": 1,
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [
          blockNumber,
          true
        ]
    }
    if(!process.env.ALCHEMY_RPC_URL){
        return;
    }
    const response=await axios.post(process.env.ALCHEMY_RPC_URL, body); 
    return response.data;
}

async function fetchRequest2(blockNumber:string) {
    const body={
        "id": 1,
        "jsonrpc": "2.0",
        "method": "eth_getBlockByNumber",
        "params": [
          blockNumber,
          true
        ]
    }
    if(!process.env.MORALIS_RPC_URL){
        return;
    }
    const response=await axios.post(process.env.MORALIS_RPC_URL, body); 
    return response.data;
}

main("deposit");

