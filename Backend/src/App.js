import express, { urlencoded,static as static_,json } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { ErrorMiddleware } from './Middleware/index.js';

const app=express();

app.use(cookieParser());

app.use(static_("public"));

app.use(urlencoded({extended:true, limit:"16kb"}));

app.use(json({limit:"50kb"}));

app.use(
  cors({
    origin:"https://localhost:5173",
    Credential:true
  })
)


app.use(ErrorMiddleware);

export default app;