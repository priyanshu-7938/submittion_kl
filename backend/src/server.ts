import "./utils/envocation.js";
import express from "express";
import Knowledge from "./services/knowledge/index.js";
import fs from "fs";
import path from "path";
import { hydrateController, hydrateCustomController } from "./controllers/utilscontrollers.js";
import bodyParser from "body-parser";
import { handleSessionCreate, messageWithSession, getMessages} from "./controllers/chat-api.js";
// import knowledge from "./services/knowledge.js";

const app = express();

app.use(bodyParser.json());

app.post("/hydrate", hydrateController);
app.post("/customhydrate", hydrateCustomController);

// main api routes.....
app.get("/createsession", handleSessionCreate);

app.post("/chat/message", messageWithSession);
app.post("/messages", getMessages);
//works....
// app.post("/context", async (req,res)=>{
//     const reqq = req.body.req;
//     const data = await knowledge.searchSimilar(reqq);
//     res.send(data);
// })



app.listen(process.env.PORT || 3000, ()=>{
    console.log("runningthe server baby.");
});
