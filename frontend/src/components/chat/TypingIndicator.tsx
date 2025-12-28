import { Leaf } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex items-end gap-2 animate-fade-in-up">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/80 to-primary/50 flex items-center justify-center flex-shrink-0">
        <Leaf className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className="glass px-4 py-3 rounded-2xl rounded-bl-md shadow-soft">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Thinking</span>
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
          <span className="w-2 h-2 rounded-full bg-accent typing-dot" />
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
