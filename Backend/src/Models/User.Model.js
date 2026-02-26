import {Schema,model} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema=new Schema({
  fullName:{
    type:String,
    required:[true,"Full Name Required"],
    minlength:3,
    maxlength:40,
    trim:true,
    lowercase:true
  },
  userName:{
    type:String,
    required:[true,"Full Name Is Required"],
    trim:true,
    minlength:3,
    maxlength:50,
    unique:true,
    lowercase:true,
    index:true
  },
  email:{
    type:String,
    required:[true,"Email Required"],
    trim:true,
    unique:true,
    lowercase:true,
    index:true
  },
  password:{
    type:String,
    required:[true,"Password Required"],
    minlength:6,
    select:false    
  },
  avtar:{
    type:String,
    default:""
  },
  lastSeen:{
    type:Date
  },
  bio:{
    type:String,
    minlength:200,
    default:""
  },
  isEmailVerifyied:{
    type:Boolean,
    default:false
  },
  status:{
    type:String,
    enum:["active","inactive"],
    defult:"active"
  },
  isOnline:{
    type:Boolean,
    default:false
  },
  refreshToken:{
    type:String,
    select:false
  },
  location:{
    type:String,
    default:""
  },
  phoneNumber:{
    type:Number,
    required:[true,"Phone Number Required"],
    minlength:10,
    trim:true,
    unique:true
  },
  emailVerificationToken:{
    type:String,
    select:false
  },
  resetPasswordToken:{
    type:String,
    select:false
  },
  resetPasswordExpire: Date
  
},{timestamps:true})

//here we hash the password before save when password modify
UserSchema.pre("save",async function(){

if(!this.isModified("password")) return null;

this.password=await bcrypt.hash(this.password,10)

});
//here we compare the input password with the user password
UserSchema.method.IsPasswordCorrect=async function(password){

return await bcrypt.password(password,this.password);

}

//here we generate acccess token
UserSchema.method.GenerateAccessToken=function(){
return jwt.sign(
  {
    userName:this.userName,
    email:this.email,
    _id:this._id,
    fullName:this.fullName
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn:"10d"
  }
)}

//here we generate refresh token
UserSchema.method.GenerateRefreshToken=function(){
  return jwt.sing(
    {
      _id:this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:"10d"
    }
  )
}
export const USER=model("USER",UserSchema)