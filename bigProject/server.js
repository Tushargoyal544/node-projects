const express = require("express");
const app = express();
const useRout = require("./router/userRouter");
const adminRout= require("./router/adminRouter")
const statRout = require("./router/staticRouter");
const cronJob=require("./crownJob/crownJob").cronjob
const db = require("./dbConnection/dbConnection");
const swaggerUI =require("swagger-ui-express")
const swaggerJsDoc=require("swagger-jsdoc")
const server=require('http').createServer(app)
const io = require('socket.io')(server);


const userController=require("./controller/userController")

app.use(express.urlencoded({extended: false}));
app.use(express.json()); 

// app.use(commonFunction.cronjob())
app.use("/api/v1/user", useRout);
app.use("/api/v1/admin",adminRout)
app.use("/api/v1/static",statRout);
app.use("/admin",adminRout)
app.use("/user",useRout)

// app.use("/static", statRout);
app.get("/", (req, res)=>{
    res.send("M1 Test");
});

const swaggerDefinition ={
    info:{
        title:"Goyal_ji",
        version:"2.0.0",
        description:"api docs",
        contact:{
            name:"tushar"
        },
    },
    server:['http://localhost:8000'],
    basePath:"",
};
var options={
    swaggerDefinition:swaggerDefinition,
    apis:["./router/*.js"],

};
const swaggerDocs=swaggerJsDoc(options);
app.get("/swagger-json",function(req,res){
    res.setHeader=("contant-type","application/json");
    res.send(swaggerDocs);
});
app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerDocs))

// ***********************socket io*******************

var userCount = 0,
    users = {},
    keys = {},
    sockets = {},
    onlineUsers = [];
io.sockets.on("connection", (socket) => {
    userCount++;
    console.log("my socket id is >>>>>", socket.id, userCount);

    socket.on("onlineUser", async (data) => {
        let allOnlineUser = await OnlineUser(data, socket.id);
        console.log("send====>", onlineUsers, allOnlineUser);
        // io.sockets.in(socket.id).emit("onlineUser", JSON.stringify(onlineUsers))
        io.sockets.emit("onlineUser", onlineUsers);
    });
    // socket.on("chat", async (data) => {
    //     try {
    //         console.log("line no 75 server====>>", data);
    //         let chatSend = await userController.chat(data);
    //         console.log("I am here to send CHAT >>>>>", chatSend);
    //         var socketUser = [data.senderId, data.receiverId];
    //         console.log("socket users>?>", socketUser);
    //         let sendingRequest = false,
    //             chatHistory = [];
    //         chatHistory = chatSend.chatHistory ? chatSend.chatHistory : [];
    //         // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&",chatHistory)
    //         onlineUsers.map((e) => {
    //             if (socketUser.includes(e.userId)) {
    //                 sendingRequest = true;
    //                 console.log("socketId=====>>>>>>>>", e.socketId);
    //                 // chatHistory = true;
    //                 if (chatSend.response_code == 200) {
    //                     chatSend.chatHistory =
    //                         e.userId == data.receiverId ? chatHistory : [];
    //                 }
    //                 io.sockets.in(e.socketId).emit("chat", chatSend);
    //             }
    //         });
    //         if (sendingRequest == false || onlineUsers.length == 0) {
    //             console.log("Line no 89=====???>>>", chatSend);
    //             io.sockets.in(socket.id).emit("chat", chatSend);
    //         }
    //     } catch (error) {
    //         // throw error;
    //         console.log("In chat===>>>", error);
    //     }
    // });

})


app.listen(8000, (error, result)=>{
    if(error){
        console.log(`Port is not listening....`);
    } else{
        console.log(`Port is listening....`);
    }
});