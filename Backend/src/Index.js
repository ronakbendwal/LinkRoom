import dotenv from 'dotenv';
dotenv.config();
import app from './App.js'
import DB_Connect from './DataBase/DB.Connect.js';


DB_Connect()

.then(()=>{

  try{

    app.listen(process.env.PORT, ()=>{

      console.log("App Started Sucessfully")

    })

    app.on('error',()=>{

      console.log("Error While App Listen")

    })

  }catch(error){

    console.log("MongoDB Connection Error :: ",error)

  }

})