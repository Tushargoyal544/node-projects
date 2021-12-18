const express = require("express");
const app = express();
const useRout = require("./router/userRouter");
const statRout = require("./router/staticRouter");
const db = require("./dbConnection/dbConnection");


app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use("/user", useRout);
app.use("/static", statRout);
app.get("/", (req, res)=>{
    res.send("M1 Test");
});
app.listen(8000, (error, result)=>{
    if(error){
        console.log(`Port is not listening....`);
    } else{
        console.log(`Port is listening....`);
    }
});