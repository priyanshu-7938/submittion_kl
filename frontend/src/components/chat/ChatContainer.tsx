import { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import WelcomeCard from "./WelcomeCard";
import { useQuerryContext, type SessionResponse } from "@/context/QuerryContext";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  sender: "bot" | "user";
  timestamp: Date;
}



const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { 
    session, 
    createSession,
    setSession,
    getMessages
  } = useQuerryContext();


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // now we have a sesion finder system if a new person. 
  useEffect(()=>{
    // fetch teh sesion if session exist tehn fetch user cahts else get the session and the get tehnseeion
    const calling = async ()=>{
      //get session..
      await new Promise(async (res,rej)=>{
        if(session){
          res(session as string);
        }else{
          // get a enw sesion....
          const data: SessionResponse = await createSession();
          // set the session in the localstorage.
          setSession(data.sessionId);
          res(data.sessionId);
        }
      })
      .then(async (sessionId)=>{
        // now fetch the messages
        const fetchedMessages = await getMessages(sessionId as string);
        console.log(fetchedMessages);
        return "helo";
      })
      .catch((e)=>{
        toast.error("Failed to load Error:", e);
      })
    }
    calling();
  },[]);

  const handleSendMessage = (content: string) => {
    setShowWelcome(false);
    // mene send kar dena  hai request..
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      </div>

      <ChatHeader />

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 md:px-6 md:py-6 space-y-4">
        {showWelcome && (
          <WelcomeCard onSuggestionClick={handleSendMessage} />
        )}
        
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default ChatContainer;
