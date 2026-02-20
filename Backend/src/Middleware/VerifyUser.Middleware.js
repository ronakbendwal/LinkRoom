import jwt from 'jsonwebtoken';
import {
  ApiError,
  AsyncHandle
} from '../Utils/index.js'
import USER from '../Models/User.Model.js'

const VerifyUser=AsyncHandle(async(req,res,next)=>{
  
  const token=req.cookies?.accessToken;

  if(!token){

    throw new ApiError(401,"Access Token Not Found || Unauthorize User");

  }

  const decodecToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

  if(!decodecToken){

    throw new ApiError(404,"Decoded Token Not Found");

  }

  const user=await USER.findById(decodecToken?._id).select("-password -refreshToken");

  if(!user){

    throw new ApiError(404,"User Not Found");

  }

  req.user=user;

  next();

})

export default VerifyUser;