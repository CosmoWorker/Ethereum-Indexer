import axios from 'axios';
import dotenv from "dotenv";
import {PrismaClient} from "../../backend/node_modules/@prisma/client/default"
dotenv.config()
let CURRENT_BLOCK_NUMBER=21709134;
const prisma=new PrismaClient();

async function main(){
    //getting interested addresses from the DB
    const interestedAddress=["0x68c905040BcA2Ed08223621b1305E61CB83a5192", "0x870248D3d08A422006813909694cE6deCF27f2b8", "0x72bB98f9de3FA19614375D860bD3973e44dAB3B8"]
    const lowercasedInterestedAddress = interestedAddress.map(x=> x.toLowerCase());
    const HEX_CURRENT_BLOCKNO="0x"+CURRENT_BLOCK_NUMBER.toString(16);
    const block=await fetchRequest1(HEX_CURRENT_BLOCKNO);
    if(!block){
        console.log("Block not found");
        return;
    }
    if (block.result.transactions.length === 0) {
        console.log("No transactions in this block");
        return;
    }
    for(const txn of block.result.transactions){
        if(lowercasedInterestedAddress.includes(txn.to)){
            console.log({
                hash: txn.hash,
                from: txn.from,
                to: txn.to,
                value: parseInt(txn.value, 16)/Math.pow(10,18)
            })
        }
    }

}
//updating balance yet to do

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

main();

