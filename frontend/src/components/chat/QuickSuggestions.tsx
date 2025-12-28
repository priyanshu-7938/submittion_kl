import { ChevronRight } from "lucide-react";

interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

const QuickSuggestions = ({ suggestions, onSelect }: QuickSuggestionsProps) => {
  return (
    <div className="space-y-2 animate-fade-in-up">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="w-full glass px-4 py-3 rounded-xl flex items-center justify-between group hover:bg-secondary/50 transition-all duration-200"
        >
          <span className="text-sm text-foreground/90 text-left">{suggestion}</span>
          <ChevronRight className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>
      ))}
    </div>
  );
};

export default QuickSuggestions;
