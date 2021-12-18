var CronJob = require('cron').CronJob;
var userModel=require('../model/userModel')
var commonFunction=require("../helper/commonFunction")

module.exports={
cronjob: async (req, res) => {
    console.log("hii");
    var query = { $and: [{ userType: "USER" }, { status: 'ACTIVE' }] }
    var result = await userModel.find(query)
    console.log("******************=>", result.length);
    // for(var i=0;i<result.length;i++){
    //     console.log("====",result[i].email)
    // }

    var subject="Good wishes"
    var text="good Morning"
    var job = new CronJob('* * */24 * * *', function() {
        for (var i = 0; i <result.length; i++) {
            var sendMailResult = commonFunction.sendMail(result[i].email, subject, text)
            console.log(result[i].email);
            console.log(sendMailResult);
        }
        
      }, null, true, 'America/Los_Angeles');
      job.start();
    }
   
       

}