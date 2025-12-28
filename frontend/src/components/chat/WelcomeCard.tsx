import { Leaf, Sparkles } from "lucide-react";

interface WelcomeCardProps {
  onSuggestionClick: (suggestion: string) => void;
}

const WelcomeCard = ({ onSuggestionClick }: WelcomeCardProps) => {
  return (
    <div className="glass rounded-2xl p-5 md:p-6 animate-fade-in-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">
            Hello! 👋
          </h2>
          <h3 className="text-lg md:text-xl font-medium text-gradient">
            Welcome to GreenRoot
          </h3>
        </div>
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center animate-pulse-glow">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Leaf className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
          </div>
        </div>
      </div>
      
      <p className="text-sm md:text-base text-muted-foreground mb-5">
        I'm your herbal wellness assistant. I can help you discover natural remedies, 
        find the perfect products for your needs, and answer any questions about our botanicals.
      </p>
      
      <div className="space-y-2">
        {[
          "What herbs help with sleep?",
          "Show me immunity boosters",
          "Natural stress relief options",
          "Best sellers this week"
        ].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full glass px-4 py-3 rounded-xl flex items-center gap-3 group hover:bg-secondary/50 transition-all duration-200 text-left"
          >
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm text-foreground/90">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeCard;
