import { createContext, useState, type ReactNode } from "react";

export const QuerryContext = createContext({});

export interface SessionResponse {
  message: string;
  sessionId: string;
}

export interface ChatMessage {
  role: "USER" | "BOT";
  content: string;
  createdAt:string;
  id: number;
}

export interface MessageResponse {
  status: boolean;
  response: string;
}

export interface HistoryResponse {
  status: boolean;
  messages: ChatMessage[];
}

const BASE_URL = import.meta.env.VITE_API_URL;

const ContextProvider = ({children}: {children: ReactNode})=>{

    const [ session, setSess ] = useState<string| null>(localStorage.getItem('session-string'));

    async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || `API Error: ${res.statusText}`);
        }
        return res.json();
    }

    function setSession(sessionString: string) {
        localStorage.setItem('session-string', sessionString);
        setSess(sessionString);
    }

    function refressSession() {
        const val = localStorage.getItem('session-string');
        if( val != session){
            setSess(val);
        }
    }

    function resetSession() {
        localStorage.removeItem('session-string');
        setSess(null);
    }


    async function createSession(): Promise<SessionResponse> {
        return request<SessionResponse>("/createsession", { method: "GET" });
    }

    async function sendMessage(sessionId: string, message: string): Promise<MessageResponse> {
        return request<MessageResponse>("/chat/message", {
        method: "POST",
        body: JSON.stringify({ sessionId, message }),
        });
    }

    async function getMessages(sessionId: string): Promise<HistoryResponse> {
        return request<HistoryResponse>("/messages", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
        });
    }

    // woint be used in here(its a protected end point)
    // async function customHydrate(insertString: string): Promise<string> {
    //     const res = await fetch(`${BASE_URL}/customhydrate`, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ insertString })
    //     });
    //     return res.text();
    // }

    return(
        <QuerryContext.Provider value = {{
            createSession,
            getMessages,
            sendMessage,
            setSession,
            refressSession,
            resetSession,
            session
        }}>
            {children}
        </QuerryContext.Provider>
    )
} 


export default ContextProvider;
