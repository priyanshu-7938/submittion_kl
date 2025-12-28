import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../../../generated/prisma/client";
const connectionString = `${process.env.DATABASE_URL}`;
class KnowledgeService {
    static instance;
    genAI;
    model;
    adapter;
    prisma;
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined");
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
        this.adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter: this.adapter });
    }
    static getInstance() {
        if (!KnowledgeService.instance) {
            KnowledgeService.instance = new KnowledgeService();
        }
        return KnowledgeService.instance;
    }
    async ingestDocument(fullText) {
        const chunks = this.chunkText(fullText, 300);
        for (const chunk of chunks) {
            try {
                const result = await this.model.embedContent(chunk);
                const vector = result.embedding.values;
                await this.prisma.$executeRaw `
          INSERT INTO knowledge_base (content, embedding) 
          VALUES (${chunk}, ${JSON.stringify(vector)}::vector)
        `;
            }
            catch (error) {
                console.error(`Error ingesting chunk: ${error}`);
                throw error + " ";
            }
        }
        console.log(`Ingested ${chunks.length} chunks.`);
    }
    async searchSimilar(query) {
        try {
            const result = await this.model.embedContent(query);
            console.log(this.model);
            const queryVector = result.embedding.values;
            const results = await this.prisma.$queryRaw `
        SELECT content 
        FROM knowledge_base 
        ORDER BY embedding <=> ${JSON.stringify(queryVector)}::vector 
        LIMIT 3
      `;
            if (results.length === 0)
                return "";
            return results.map((row) => row.content).join("\n---\n");
        }
        catch (error) {
            console.error(error);
            console.error(`Error searching similar content: ${error}`);
            throw error + " ";
        }
    }
    chunkText(text, maxSize) {
        const chunks = [];
        let currentChunk = "";
        const sentences = text.split(". ");
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length < maxSize) {
                currentChunk += sentence + ". ";
            }
            else {
                if (currentChunk)
                    chunks.push(currentChunk.trim());
                currentChunk = sentence + ". ";
            }
        }
        if (currentChunk)
            chunks.push(currentChunk.trim());
        return chunks;
    }
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
export default KnowledgeService.getInstance();
