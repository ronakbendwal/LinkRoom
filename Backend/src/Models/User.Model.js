import {Schema,model} from 'mongoose';


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

export const USER=model("USER",UserSchema)