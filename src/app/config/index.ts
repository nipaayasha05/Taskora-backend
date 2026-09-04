import dotenv from "dotenv";
import path from "path";


dotenv.config({path:path.join(process.cwd(),'.env')})

export default {
    nodeEnv:process.env.NODE_ENV,
    port:parseInt(process.env.PORT!),
    app_url:process.env.APP_URL_URL!,
    databaseUrl:process.env.DATABASE_URL!,
}
