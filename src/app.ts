import express, { Application, Request, Response } from 'express';
import connectDB from "../db/db";
import dotenv from 'dotenv';

dotenv.config();
connectDB();

const app : Application = express()

app.get('/',(req: Request,res: Response)=> {
    res.status(200).json({data:"api runnings"})
})

const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log("Server running")
})