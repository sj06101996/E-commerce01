const mongoose = require ("mongoose")
let url = "mongodb://localhost:27017/packages"


let db = mongoose.connect(url,(err)=>{
  if(err)
  {
      console.log("connection failed",err)
  }
  else
  {
      console.log("database connected")
  }
})
module.exports =db