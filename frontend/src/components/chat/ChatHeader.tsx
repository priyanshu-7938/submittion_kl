import { Leaf, Settings, Phone, Volume2 } from "lucide-react";

const ChatHeader = () => {
  return (
    <header className="glass-strong px-4 py-3 md:px-6 md:py-4 flex items-center justify-between border-b border-border/20 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
          <Leaf className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground text-sm md:text-base">GreenRoot Botanicals</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Online • Wellness Assistant</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
          <Phone className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
          <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
