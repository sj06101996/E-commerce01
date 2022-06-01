const mongoose = require("../config/db.config")
const userModel = require("../models/users")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const transporter = require("../config/emailconfig")
const dotenv = require("dotenv") 
dotenv.config()


class userController{
    //USER REGISTRATION
    static userRegistration = async(req,res)=>{
        const{name, email, password, password_confirmation, tc} = req.body
        const user = await userModel.findOne({email:email})
        if(user){
            res.send({"status":"failed", "message":"email already exists"})
        }else{
            if(name && email && password && password_confirmation && tc){
                if(password === password_confirmation){
                    //Password encryption using BCRYPT
                    try{
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password,salt)
                   const doc = new userModel({
                       name:name,
                       email:email,
                       password:hashPassword,
                       tc:tc
                   })
                   await doc.save()
                   const saved_user = await userModel.findOne({email:email})
                   
                   //Generate JWT token
                   const token = jwt.sign({userID: saved_user._id},process.env.JWT_SECRET_KEY,{expiresIn:'5d'})

                   res.status(201).send({"status":"success", "message":"Registered successfully","token":token})
                    } catch (error){
                        res.send({"status":"failed", "message":"unable to Register"})
                    }
                }else{res.send({"status":"failed", "message":"password and confirm password doesn't match"})}
                
            }
            else{res.send({"status":"failed", "message":"all fields are required"})}
        }


    }
    //USER LOGIN
     static userLogin = async(req,res)=>{
         try{
             const{email, password} = req.body
             if(email && password)
             {
                const user = await userModel.findOne({email:email})
                if(user != null){
                    const ismatch = await bcrypt.compare(password,user.password)
                    if((user.email === email) && ismatch)
                    {
                        //generate JWT token
                        const token = jwt.sign({userID: user._id},process.env.JWT_SECRET_KEY,{expiresIn:'5d'})
                        res.send({"status":"success", "message":"Login Success","token":token})
                    }else{
                        res.send({"status":"failed", "message":"Email or Password is not valid"})
                    }
                }else{
                    res.send({"status":"failed", "message":"you are not a registered user"})
                }
             }
             else
             {
                res.send({"status":"failed", "message":"all fields are required"}) 
             }
         }
         catch(error){
             console.log(error)
             res.send({"status":"failed", "message":"unable to login"})
         }
     }
     //Change user Password
     static changeUserPassword = async(req,res)=>{
         const{password,password_confirmation} = req.body
         if(password && password_confirmation)
         {
            if(password !== password_confirmation)
            {
                res.send({"status":"failed", "message":"New password and confirm New password doesn't match"})
            }else
            {
                const salt = await bcrypt.genSalt(10)
                const newHashPassword = await bcrypt.hash(password,salt)
                await userModel.findByIdAndUpdate(req.user._id,{$set:{password:newHashPassword}})
                res.send({"status":"success", "message":"Password changed successfully"})

            }
         }else{
            res.send({"status":"failed", "message":"all fields are required"})
         }
     }
     //Logged User
     static loggedUser = async(req,res)=>{
         res.send({"user":req.user})
     }
     //Send User password Reset email
     static sendUserPasswordResetEmail = async(req,res)=>{
         const{email} = req.body
         if(email){
            const user = await userModel.findOne({email:email})
            
            if(user){
                const secret = user._id + process.env.JWT_SECRET_KEY
                 const token = jwt.sign({userID: user._id},secret,{expiresIn:'15m'})
                 const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
                 console.log(link)

                 
                 //Send Email using Nodemailer
                 let info = await transporter.sendMail({
                     from:process.env.EMAIL_FROM,
                     to:user.email,
                     subject:"password reset link",
                     html:`<a href=${link}>click here</a>to reset your password`
                 })
                 res.send({"status":"success", "message":"Password Reset Email sent...Pleasecheck your email "})
            }else{
                res.send({"status":"failed", "message":"Email doesn't exists"})
            }
         }else{
             res.send({"status":"failed", "message":"Email field is required"})
         }
     }
     //User password Reset
     static userPasswordReset = async(req,res)=>{
         const {password,password_confirmation} = req.body
         const {id,token} = req.params
         const user = await userModel.findById(id)
         console.log(user)
         const new_secret = user._id + process.env.JWT_SECRET_KEY
         console.log(new_secret)
         try {
            //const new_secret = user._id + process.env.JWT_SECRET_KEY
            //console.log(new_secret)
             jwt.verify(token,new_secret)
             if(password && password_confirmation)
             {
                 if(password !== password_confirmation)
                 {
                    res.send({"status":"failed", "message":"new password and confirm password doesn't match"})
                 }else{
                    const salt = await bcrypt.genSalt(10)
                    const hashPassword = await bcrypt.hash(password,salt)
                    await userModel.findByIdAndUpdate(user._id,{$set:{password:newHashPassword}})
                    res.send({"status":"success", "message":"password reset successfully"})
                 }

             }else{
                res.send({"status":"failed", "message":"all fields are required"})
             }
         } catch (error) {
             res.send({"status":"failed","message":"Invalid Token"})
         }
     } 
}


module.exports = userController