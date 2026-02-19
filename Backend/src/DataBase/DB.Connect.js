import mongoose from 'mongoose';

import { DBName } from '../Constant.js';

const DB_Connect=async()=>{

  try{

    console.log("This is our db uri", process.env.DB_URI)

    console.log("this is our db name", DBName)

    const connectionResponse=await mongoose.connect(process.env.DB_URI,{DBName})

    console.log("MongoDB connected :: Host ::",connectionResponse.connections)

  }catch(err){

    console.log("DB connection Error ::",err);

    process.exit(1);

  }

}

export default DB_Connect;