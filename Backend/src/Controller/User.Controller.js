import { 
  AsyncHandle,
  ApiError,
  ApiResponse,
  CloudinaryUpload,
  CloudinaryDelete
 } from "../Utils";
import jwt from 'jsonwebtoken'
 import USER from '../Models/User.Model.js';

 const GenerateAcessRefreshTokne=async(userId)=>{
  try{
    const user=await USER.findById(userId);
    const refreshtoken=user.GenerateRefreshToken();
    const accesstoken=user.GenerateAccessToken();
    user.refreshToken=refreshtoken;
    await user.save();
    return {refreshtoken,accesstoken}
  }catch(err){
    console.log(err)
    throw new ApiError(500,"Error While Generating Tokens")
  }};

  const SignUPUser=AsyncHandle(async(req,res)=>{
    console.log("Inside signup controller");

    console.log("this is req.body", req.body)

    const [
      userName,
      phoneNumber,
      email,
      fullName,
      password,
      bio,
      location,
    ]=req.body;

    const isAnyFieldEmpty=Object.values(req.body)
    .some((value)=>!value || value==="" || value===null || value===undefined)

    if(!isAnyFieldEmpty){
      throw new ApiError(400,"All Fields Are Required")
    }

    const exitedUser=await USER.findOne({
      $or:[{email:email.toLowerCase()},{userName:userName.toLowerCase()}]
    })

    if(exitedUser){
      throw new ApiError(400,"User Already Exist")
    }

    const createdUser=await USER.create({
      userName,
      phoneNumber,
      email,
      password,
      bio,
      location,
      fullName
    });

    const createdUserReferance=await USER.findById(createdUser._id)
    .select("-password")

    if(!createdUserReferance){
      throw new ApiError(500,"Server Error While Creating User")
    }

    return res.status(200)
    .json(
      new ApiResponse(
        200,
        createdUserReferance,
        "User Sucessfully Created"
      )
    )
  });

  const LoginUser=AsyncHandle(async(req,res)=>{
    console.log("Inside login controller");
    console.log("this is req.body",req.body);

    const {
      userName,
      email,
      password
    }=req.body;

    if(!userName && !email){
      throw new ApiError(400,"UserName Or Email Required");
    }

    const userInfo=await USER.findOne({
      $or:[{email:email},{userName:userName}]
    });

    if(!userInfo){
      throw new ApiError(404,"User Not Found");
    }

    const passwordChecked=await userInfo.IsPasswordCorrect(password);

    if(!passwordChecked){
      throw new ApiError(401,"Invalid Password ")
    }

    const {accesstoken,refreshtoken}=await GenerateAcessRefreshTokne(userInfo?._id);

    const returnUser=await USER.findById(userInfo?._id).select("-password -refreshToken");

    if(!returnUser){
      throw new ApiError(404,"User Not LoggedIn")  
    }
    const options={
       secure: process.env.NODE_ENV === "production",
       httpOnly:true,
       sameSite:"lax"
    }
    return res.status(200)
    .cookie("refreshToken",refreshtoken,options)
    .cookie("accesToken",accesstoken,options)
    .json(
      new ApiResponse(
        200,
        returnUser,
      "User Sucessfully LoggedIn"
      )
    )
  })

  const LogoutUser=AsyncHandle(async(req,res)=>{

    console.log("Inside Logout Controller");

    await USER.findByIdAndUpate(
      req.user?._id,
      {$set:{
        refreshToken:undefined
      }}
    )

    const options={
      secure:process.env.NODE_ENV === "production",
      httpOnly:true,
      sameSite:"lax"
    }

    return res.status(200)
    .cookie("refreshToken",options)
    .cookie("accessToken",options)
    .json(
      new ApiResponse(
        200,
        {},
        "User Sucessfully Logout"
      )
    )
  })

  const DeleteUser=AsyncHandle(async(req,res)=>{

    console.log("Inside Delete Controller");

    const DeleteUser=await USER.findByIdAndDelete(req.user?._id);

    if(!DeleteUser){
      throw new ApiError(404,"User Not Found");
    }
    
    const options={
      secure:process.env.NODE_ENV === "production",
      httpOnly:true,
      sameSite:"lax"
    }

    return res.status(200)
    .cookie("refreshToken",options)
    .cookie("accessToken",options)
    .json(
      new ApiResponse(
        200,
        {},
        "User Sucessfully Deleted"
      )
    )
  })

  const GetUser=AsyncHandle(async(req,res)=>{

    console.log("Inside get current user controller ");

    const currentUser=await USER.findById(req.user?._id).select("-password -refreshTokne")

    if(!currentUser){
      throw new ApiError(404,"Unable To Find User");
    }

    return res.status(200)
    .json(
      new ApiResponse(
        200,
        currentUser,
        "Current User Found Sucessfully"
      )
    )
  })




  export {
    SignUPUser,
    LoginUser,
    LogoutUser,
    DeleteUser,
    GetUser

  }