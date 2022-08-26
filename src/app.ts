import express, { Application, Request, Response } from 'express'

const app : Application = express()

app.get('/',(req: Request,res: Response)=> {
    res.status(200).json({data:"api runnings"})
})

const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log("Server running")
})