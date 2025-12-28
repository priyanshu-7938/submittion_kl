import Guards from "../services/guards/index.js";
import LLM from "../services/llm/index.js";
import DataLayer from "../services/data/index.js";
import { Role } from "../../generated/prisma/client.js";
const handleSessionCreate = async (req, res) => {
    // pinging the data layer to create an session..
    const sessionId = await DataLayer.createSession();
    res.status(200).json({
        message: "Create a session for the chat",
        sessionId
    });
};
const messageWithSession = async (req, res) => {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) {
        // there is an error.....
        res.status(400).json("failed to validate body");
        return;
    }
    try {
        // path uses should be 
        // guards first then
        // data layer
        // knowledge layer is required via data layer...
        // llm 
        // Guards validation
        const guardDetails = await Guards.validate(message, sessionId).catch((e) => {
            console.error("[messageWithSession] Guard failed to validate the result.", e);
            throw Error("Guard Validation failed with error.");
        });
        if (!guardDetails.isValid) {
            console.error("[messageWithSession] Guard fail error: ", guardDetails.error, ", reason: ", guardDetails.reason);
            res.status(200).json({ status: true, messsage: "Guard failed, contain malecious text or reaced limit. Cant reply to the mesage", });
            return;
        }
        const chatHistroy = await DataLayer.getChatHistory(sessionId);
        // Data Layer: Knowledge Context
        const context = await DataLayer.getKnowledgeContext(message);
        // LLM: Generate Reply
        const response = await LLM.generateReply(chatHistroy, context.context, message);
        // Add messages to chat
        await DataLayer.addChatMessages(sessionId, [
            { role: Role.USER, content: message },
            { role: Role.BOT, content: response }
        ]);
        res.status(200).json({ status: true, response });
    }
    catch (e) {
        res.status(401).json({ status: false, message: "failed to validate or generate a res.", error: e });
    }
};
const getMessages = async (req, res) => {
    // well man..
    const { sessionId } = req.body;
    if (!sessionId) {
        // there is an error.....
        res.status(400).json("failed to validate body");
        return;
    }
    try {
        const chatHistroy = await DataLayer.getChatHistory(sessionId);
        res.status(200).json({ status: true, messages: chatHistroy });
    }
    catch (err) {
        res.status(500).json({ status: false, message: "Failed to fetch messages.", error: err instanceof Error ? err.message : err });
    }
};
export { handleSessionCreate, messageWithSession, getMessages };
