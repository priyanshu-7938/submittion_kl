import { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import WelcomeCard from "./WelcomeCard";

interface Message {
  id: string;
  content: string;
  sender: "bot" | "user";
  timestamp: Date;
}


const defaultResponse = "Thank you for your interest! 🌱 Our wellness experts are here to help you find the perfect natural solutions. Could you tell me more about what you're looking for? Whether it's sleep support, immunity, stress relief, or something else - I'm here to guide you.";

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    // Hide welcome card
    setShowWelcome(false);
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
