import { useState, type KeyboardEvent } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-strong p-3 md:p-4 border-t border-border/20 sticky bottom-0">
      <div className="flex items-center gap-2 md:gap-3">
        <button className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary hover:from-primary/30 hover:to-primary/20 transition-all flex-shrink-0">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about our herbal products..."
            disabled={disabled}
            rows={1}
            className="w-full bg-secondary/50 border border-border/30 rounded-xl px-4 py-3 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition-all disabled:opacity-50"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
        </div>
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-glow hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex-shrink-0"
        >
          <Send className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
