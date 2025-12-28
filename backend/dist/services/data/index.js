import { createClient } from "redis";
import { PrismaClient } from "../../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import knowledge from "../knowledge";
const connectionString = `${process.env.DATABASE_URL}`;
class DataLayer {
    static instance;
    redisClient;
    adapter;
    prisma;
    config;
    isConnected = false;
    constructor() {
        if (!process.env.REDIS_URL)
            throw Error("Cant locate Redis-url in env");
        this.config = {
            chatHistoryTTL: 3600, // 1 hour
            knowledgeTTL: 86400, // 24 hours
            redisUrl: process.env.REDIS_URL,
        };
        this.redisClient = createClient({
            url: this.config.redisUrl,
        });
        this.adapter = new PrismaPg({ connectionString });
        this.prisma = new PrismaClient({ adapter: this.adapter });
        this.setupRedisHandlers();
    }
    setupRedisHandlers() {
        this.redisClient.on("error", (err) => {
            console.error("Redis Client Error:", err);
            this.isConnected = false;
        });
        this.redisClient.on("connect", () => {
            console.log("Redis Client Connected");
            this.isConnected = true;
        });
    }
    static getInstance() {
        if (!DataLayer.instance) {
            DataLayer.instance = new DataLayer();
        }
        return DataLayer.instance;
    }
    async connect() {
        if (!this.isConnected) {
            await this.redisClient.connect();
        }
    }
    async disconnect() {
        if (this.isConnected) {
            await this.redisClient.quit();
            this.isConnected = false;
        }
        await this.prisma.$disconnect();
        console.log("Disconnected from Redis and Prisma");
    }
    // internal key gen functions..
    getSessionKey(sessionId) {
        return `session:${sessionId}`;
    }
    getSearchKey(query) {
        return `search:${query.toLowerCase().trim().replace(/\s+/g, "_")}`;
    }
    // public fxn:
    /**
     * Get knowledge context for RAG
     * Flow: Check Redis → If miss, call knowledgeSearchFn → Cache result → Return
     *
     * @param query - User's query
     * @param knowledgeSearchFn - Function that performs vector search in DB
     * @returns Knowledge context string
     */
    async getKnowledgeContext(// done!
    query) {
        const cacheKey = this.getSearchKey(query);
        try {
            // fail safe for large query strings.
            const MAX_REDIS_KEY_LENGTH = 512;
            if (cacheKey.length > MAX_REDIS_KEY_LENGTH) {
                // Don't check cache, don't cache result
                console.warn(`Skipping Redis cache for query (key too long, len=${cacheKey.length}): "${query}"`);
                const context = await knowledge.searchSimilar(query);
                return { context, source: "database" };
            }
            if (this.isConnected) {
                const cached = await this.redisClient.get(cacheKey);
                if (cached) {
                    console.log(`✓ Knowledge Cache HIT: "${query}"`);
                    return { context: cached, source: "cache" };
                }
            }
            // Cache MISS
            console.log(`✗ Knowledge Cache MISS: "${query}" - Searching DB...`);
            const context = await knowledge.searchSimilar(query);
            // Cache the context
            if (this.isConnected && context) {
                await this.redisClient.setEx(cacheKey, this.config.knowledgeTTL, context);
                console.log(`✓ Cached knowledge context for: "${query}"`);
            }
            return { context, source: "database" };
        }
        catch (error) {
            console.error("Error getting knowledge context:", error);
            throw error + " ";
        }
    }
    /**
     * GET CHAT HISTORY - Cache first, then Prisma
     */
    async getChatHistory(sessionId) {
        try {
            const cacheKey = this.getSessionKey(sessionId);
            // Try to get from cache
            if (this.isConnected) {
                const cached = await this.redisClient.get(cacheKey);
                if (cached) {
                    console.log(`Cache HIT for chat history: ${sessionId}`);
                    return JSON.parse(cached);
                }
            }
            // Cache MISS - fetch from Prisma
            console.log(`Cache MISS for chat history: ${sessionId}`);
            const messages = await this.prisma.chatMessage.findMany({
                where: { sessionId },
                orderBy: { createdAt: "asc" },
            });
            if (!messages) {
                throw Error("Cant find the relevent session.");
            }
            const cachedMessages = messages.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt.toISOString(),
            }));
            if (this.isConnected) {
                await this.redisClient.setEx(cacheKey, this.config.chatHistoryTTL, JSON.stringify(cachedMessages));
            }
            return cachedMessages;
        }
        catch (error) {
            console.error("Error getting chat history:", error);
            throw error + " ";
        }
    }
    /**
   * ADD MESSAGES TO CHAT – Updates both cache and database
   */
    async addChatMessages(sessionId, messages) {
        try {
            if (!messages.length)
                return [];
            const createdMessages = await this.prisma.chatMessage.createMany({
                data: messages.map((msg) => ({
                    sessionId: String(sessionId),
                    content: msg.content,
                    role: msg.role,
                })),
            });
            // 2️⃣ Fetch inserted rows (needed to get ids + timestamps)
            const dbMessages = await this.prisma.chatMessage.findMany({
                where: { sessionId },
                orderBy: { createdAt: "desc" },
                take: messages.length,
            });
            const cachedMessages = dbMessages
                .reverse()
                .map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                createdAt: msg.createdAt.toISOString(),
            }));
            // 3️⃣ Update Redis cache
            if (this.isConnected) {
                const cacheKey = this.getSessionKey(sessionId);
                const existingHistory = await this.getChatHistory(sessionId);
                await this.redisClient.setEx(cacheKey, this.config.chatHistoryTTL, JSON.stringify([...existingHistory, ...cachedMessages]));
            }
            return cachedMessages;
        }
        catch (error) {
            console.error("Error adding chat messages:", error);
            throw error + " ";
        }
    }
    /**
   * Create a new session
   * @returns New session UUID
   */
    async createSession() {
        try {
            const sess = await this.prisma.session.create({});
            const sessionId = sess.id;
            console.log("sessionid:", sessionId);
            // Initialize in cache
            const sessionData = {
                sessionId,
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            if (this.isConnected) {
                await this.redisClient.setEx(this.getSessionKey(sessionId), this.config.chatHistoryTTL, JSON.stringify(sessionData));
            }
            console.log(`✓ Created new session: ${sessionId}`);
            return sessionId;
        }
        catch (error) {
            console.error("Error creating session:", error);
            throw error + " ";
        }
    }
    // cleaning redis cache
    async clearAllCache() {
        if (this.isConnected) {
            await this.redisClient.flushAll();
            console.log("Cleared all cache");
        }
    }
    async getCacheStats() {
        if (!this.isConnected) {
            return { isConnected: false, dbSize: 0 };
        }
        const dbSize = await this.redisClient.dbSize();
        return {
            isConnected: this.isConnected,
            dbSize,
        };
    }
}
export default DataLayer.getInstance();
