import { Leaf } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    sender: "bot" | "user";
    timestamp: Date;
  };
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isBot = message.sender === "bot";
  
  return (
    <div 
      className={`flex items-end gap-2 animate-fade-in-up ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/80 to-primary/50 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div 
        className={`max-w-[80%] md:max-w-[70%] px-4 py-3 shadow-soft ${
          isBot 
            ? "glass rounded-2xl rounded-bl-md" 
            : "bg-gradient-to-br from-primary to-primary/80 rounded-2xl rounded-br-md"
        }`}
      >
        <p className={`text-sm md:text-base leading-relaxed ${isBot ? "text-foreground" : "text-primary-foreground"}`}>
          {message.content}
        </p>
        <span className={`text-[10px] mt-1 block ${isBot ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      {!isBot && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-accent-foreground">You</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
