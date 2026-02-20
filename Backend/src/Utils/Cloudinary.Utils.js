
import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

console.log(process.env)

cloudinary.config({

   cloud_name :process.env.CLOUDINARY_CLOUD_NAME,

   api_key: process.env.CLOUDINARY_API_KEY,

   api_secret: process.env.CLOUDINARY_API_SECRET

});

const CloudinaryUpload=async(filePath,folder)=>{

  try{

    console.log("inside cloudinary file upload ");

    if(!filePath){

      console.log("file path required");

    }

    console.log("1st phase pass");

    const UploadResponse=await cloudinary.uploader.upload(filePath,{

      resource_type:"auto",

      folder:folder

    });

    fs.unlinkSync(filePath)

    console.log("this is cloudinary upload response",UploadResponse);

    console.log("Sucessfully File Uploaded");

    return UploadResponse;

  }catch(err){

    fs.unlinkSync(filePath)

    console.log("Cloudinary File Upload :: Error :: ",err)

  }
}


const CloudinaryDelete=async(filePath,type,folder)=>{

  try{
    
    console.log("Inside cloudinary file Deletion");

    if(!filePath){

      console.log("File Path Required");

    }

    console.log("1st phase of cloudinary pass");

    const deleteResponse=await cloudinary.uploader.destroy(filePath,{

      resource_type:type,

      filder:folder

    })

    if(deleteResponse.result!=="ok"){

      console.log("Cloudinary File Deletion Failed ::",deleteResponse );

      return null;

    }

    console.log("This is our deletion response", deleteResponse);

    return deleteResponse;

  }catch(err){

    console.log("Cloudinary File Deletion :: Error ::",err);

  }
}


export {CloudinaryUpload,CloudinaryDelete}