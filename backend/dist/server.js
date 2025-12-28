import "./utils/envocation";
import express from "express";
import { hydrateController, hydrateCustomController } from "./controllers/utilscontrollers";
import bodyParser from "body-parser";
import { handleSessionCreate, messageWithSession, getMessages } from "./controllers/chat-api";
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
app.listen(3000, () => {
    console.log("runningthe server baby.");
});
