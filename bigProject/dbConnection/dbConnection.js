const mongoose = require("mongoose");
mongoose.connect(`mongodb://localhost:27017/bigProject`, {useNewUrlParser: true, useUnifiedTopology: true}, (connectionError, connectionResult)=>{
    if(connectionError){
        console.log("Database is not connected");
    } else{
        console.log("Database has been connected");
    }
});