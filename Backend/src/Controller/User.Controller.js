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

    const {
      userName,
      phoneNumber,
      email,
      fullName,
      password,
      bio,
      location,
    }=req.body;

    const isAnyFieldEmpty=Object.values(req.body)
    .some((value)=>!value || value==="" || value===null || value===undefined)

    if(isAnyFieldEmpty){
      throw new ApiError(400,"All Fields Are Required")
    }

    const exitingUser=await USER.findOne({
      $or:[{email:email?.toLowerCase()},{userName:userName?.toLowerCase()}]
    })

    if(exitingUser){
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

    return res.status(201)
    .json(
      new ApiResponse(
        201,
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
      $or:[{email:email?.toLowerCase()},{userName:userName?.toLowerCase()}]
    });

    if(!userInfo){
      throw new ApiError(404,"User Not Found");
    }

    if(!password){
      throw new ApiError(400,"Password Required")
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
    .cookie("accessToken",accesstoken,options)
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

    await USER.findByIdAndUpdate(
      req.user?._id,
      {$unset:{
        refreshToken:1
      }}
    )

    const options={
      secure:process.env.NODE_ENV === "production",
      httpOnly:true,
      sameSite:"lax"
    }

    return res.status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
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

    const user=await USER.findById(req.user?._id);

    if(!user){
      throw new ApiError(404,"User Not Found");
    }

    const currentavtar=user?.avtar;

    if(currentavtar){

      await CloudinaryDelete(currentavtar)

    }

    const DeleteUser=await USER.findByIdAndDelete(req.user?._id);

    if(!DeleteUser){

      throw new ApiError(404,"User Not Found");
    }
    
    const options={
      secure:process.env.NODE_ENV === "production",
      httpOnly:true,
      sameSite:"lax"
    }

    return res.status(204)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .send()
  })

  const GetUser=AsyncHandle(async(req,res)=>{

    console.log("Inside get current user controller ");

    const currentUser=await USER.findById(req.user?._id).select("-password -refreshToken")

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

  const UpdatePassword=AsyncHandle(async(req,res)=>{

    console.log("Inside upate password controller ");

    console.log("this is reqbody",req.body);

    const {newPassword,password}=req.body;

    if(!password){
      throw new ApiError(400,"Old Password Are Missing")
    }

    if(!newPassword){
      throw new ApiError(400,"New Password Are Missing");
    }

    if(newPassword===password){
      throw new ApiError(409,"Use Different Password")
    }

    const user=await USER.findById(req.user?._id);
    const VerifyPassword=await user.IsPasswordCorrect(password);

    if(!VerifyPassword){
      throw new ApiError(403,"Enter Correct Password")
    }

    user.password=newPassword;

    await user.save();

    const updatedUser = await USER.findById(user._id)
    .select("-password -refreshToken");

    return res.status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "User Password Sucessfully Updated"
      )
    )
  })

  const ProfileImage=AsyncHandle(async(req,res)=>{

    console.log("Inside Profile Image Controller");

    console.log("this if req.files",req.file);

    if(!req.file?.path){
      throw new ApiError(400,"Avtar File Missing")
    }

    const user=await USER.findById(req.user?._id);

    if(!user){
      throw new ApiError(404,"User Not Found");
    }

    const existedImage=user?.avtar;

    if(existedImage){
      const DeleteReferance=await CloudinaryDelete(existedImage);
      if(DeleteReferance){
        console.log("previous image sucessfully deleted")
      }
    }

    const UploadNewImageReferance=await CloudinaryUpload(req.file?.path);

    if(!UploadNewImageReferance?.url){
      throw new ApiError(500,"Server Error While Upload File In Cloudinary");
    }

    const uploadedAvtarUser=await USER.findByIdAndUpdate(
      user?._id,
      {
      $set:{
        avtar:UploadNewImageReferance
      }
    },{new:true}).select("-password -refreshToken")

    if(!uploadedAvtarUser){
      throw new ApiError(500,"Server Error While Uploading File In DataBase")
    }

    return res.status(200)
    .json(
      new ApiResponse(
        200,
        uploadedAvtarUser,
        "Avtar Image Sucessfully Uploaded"
      )
    )
  })

  
  export {
    SignUPUser,
    LoginUser,
    LogoutUser,
    DeleteUser,
    GetUser,
    UpdatePassword,
    ProfileImage,
  }