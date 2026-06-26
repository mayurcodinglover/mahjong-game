import {createServer} from "http"
import next from "next"
import {Server} from "socket.io"
import initializeSocket from "./socket/index.js"


const app=next({dev:true})

const handle=app.getRequestHandler();


const PORT=process.env.PORT || 3000

app.prepare().then(()=>{
    const httpServer=createServer((req,res)=>{
        handle(req,res);
    });
    const io=new Server(httpServer,{
        cors:{
            origin:"*",
            methods:['GET','POST'],
        },
    });
     // Hand io to our socket initializer — all event registration happens there
  initializeSocket(io); // NEW — replaces the old inline io.on('connection') block
  
    httpServer.listen(PORT,()=>{
        console.log(`> server ready on http://localhost:${PORT}`)
    });
});