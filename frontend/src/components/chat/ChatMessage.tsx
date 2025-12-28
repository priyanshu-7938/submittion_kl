import { Leaf } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { type ChatMessage as Messages} from "../../context/QuerryContext";
interface ChatMessageProps {
  message: Messages
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isBot = message.role === "BOT";
  
  return (
  <div 
      className={`flex items-end gap-2 animate-fade-in-up ${isBot ? "justify-start" : "justify-end"}`}
    >
      {/* Bot Icon */}
      {isBot && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/80 to-primary/50 flex items-center justify-center flex-shrink-0">
          <Leaf className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      {/* Message Bubble */}
      <div 
        className={`max-w-[80%] md:max-w-[70%] px-4 py-3 shadow-soft ${
          isBot 
            ? "glass rounded-2xl rounded-bl-md" 
            : "bg-gradient-to-br from-primary to-primary/80 rounded-2xl rounded-br-md"
        }`}
      >
        {/* 2. Replaced simple <p> with ReactMarkdown and custom styling */}
        <div className={`text-sm md:text-base leading-relaxed ${isBot ? "text-foreground" : "text-primary-foreground"}`}>
          <ReactMarkdown
            components={{
              // Override default elements to add Tailwind classes
              ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
              strong: ({node, ...props}) => <span className="font-bold" {...props} />,
              a: ({node, ...props}) => <a className="underline hover:text-accent" target="_blank" rel="noopener noreferrer" {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Timestamp */}
        <span className={`text-[10px] mt-1 block ${isBot ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
          {new Date(message.createdAt).toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
      
      {/* User Icon */}
      {!isBot && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-accent-foreground">You</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
