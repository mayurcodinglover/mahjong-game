import {createServer} from "http"
import next from "next"
import {Server} from "socket.io"


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
    io.on("connection",(socket)=>{
        console.log(`[socket] client connected :${socket.id}`)

        socket.on('disconnect',()=>{
            console.log(`[socket] client disconnected :${socket.id}`);
        });
    });
    httpServer.listen(PORT,()=>{
        console.log(`> server ready on http://localhost:${PORT}`)
    });
});