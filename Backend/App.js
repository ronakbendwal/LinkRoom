import express from 'express';

const app=express();

app.get('/',(req,res)=>{
  res.send("server");
})

export default app;