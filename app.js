const express = require("express");
const connectDB = require("./db/db")
const dotenv = require("dotenv")
const routerAuth = require('./routes/auth');
const routerProf = require('./routes/profile');
const cors = require('cors');
const fileUpload = require('express-fileupload');

dotenv.config();
connectDB();
const app = express()
// app.use(fileUpload())
app.use(cors(),express.json())

app.use("/auth", routerAuth);
app.use("/profile",routerProf);

app.get('/',(req,res)=> {
    res.status(200).json({data:"api runnings"})
})

const port = process.env.PORT || 8000

app.listen(port, ()=>{
    console.log("Server running")
})