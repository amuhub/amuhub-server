import express, { application, Application, Request, Response } from 'express';
import connectDB from "./db/db";
import dotenv from 'dotenv';
import routerAuth from './routes/auth';

dotenv.config();
connectDB();

const app : Application = express()
app.use(express.json())

app.use("/auth", routerAuth);

app.get('/',(req: Request,res: Response)=> {
    res.status(200).json({data:"api runnings"})
})

const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log("Server running")
})