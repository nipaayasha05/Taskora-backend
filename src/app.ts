import cookieParser from "cookie-parser";
import { Application, Request, Response } from "express";
import express from "express";
import cors from "cors";
import config from "./app/config";

const app:Application=express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors(
    {
        origin:config.app_url,
        credentials:true,
    }
))


app.get("/", async(req:Request,res:Response)=>{
    res.send(" Welcome to Taskora")
})

export default app