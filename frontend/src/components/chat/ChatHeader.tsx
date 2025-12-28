import { Leaf } from "lucide-react";

const ChatHeader = () => {
  return (
    <header className="glass-strong flex items-center justify-between border-b border-border/20 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 md:w-12 md:h-12 rounded-2xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
          <Leaf className="w-[40px] h-[40px] md:w6 md:h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-xs md:text-base">GreenRoot Botanicals</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Online • Wellness Assistant</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
      </div>
    </header>
  );
};

export default ChatHeader;
