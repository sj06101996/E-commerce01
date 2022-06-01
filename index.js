const express = require("express")
const cors = require("cors")
const userRoute = require("./routes/userRoute")
const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/user",userRoute)
const userRoutes = require("./routes/userRoute")

app.listen(2000,(err)=>{
    if(err){console.log("error in server running",err)}
    else{console.log("server is up and running",2000)}
})