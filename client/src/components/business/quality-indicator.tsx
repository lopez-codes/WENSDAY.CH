import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";

interface QualityIndicatorProps {
  hasErrors?: boolean;
  confidenceScore?: number;
  needsReview?: boolean;
  factChecked?: boolean;
  errorDetails?: string;
  businessCategory?: string;
}

export default function QualityIndicator({
  hasErrors = false,
  confidenceScore = 0,
  needsReview = false,
  factChecked = false,
  errorDetails,
  businessCategory
}: QualityIndicatorProps) {
  const getQualityIcon = () => {
    if (hasErrors) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (needsReview) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    if (factChecked && confidenceScore > 80) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <HelpCircle className="w-4 h-4 text-gray-500" />;
  };

  const getQualityLabel = () => {
    if (hasErrors) return "Fehler erkannt";
    if (needsReview) return "Prüfung erforderlich";
    if (factChecked && confidenceScore > 80) return "Verifiziert";
    return "Standard";
  };

  const getQualityColor = () => {
    if (hasErrors) return "destructive";
    if (needsReview) return "outline";
    if (factChecked && confidenceScore > 80) return "default";
    return "secondary";
  };

  const getTooltipContent = () => {
    const items = [];
    
    if (confidenceScore > 0) {
      items.push(`Vertrauenswert: ${confidenceScore}%`);
    }
    
    if (businessCategory) {
      items.push(`Kategorie: ${businessCategory}`);
    }
    
    if (errorDetails) {
      items.push(`Details: ${errorDetails}`);
    }
    
    if (factChecked) {
      items.push("Fakten geprüft");
    }

    return items.length > 0 ? items.join('\n') : "Keine zusätzlichen Informationen";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={getQualityColor() as any} className="gap-1 text-xs">
            {getQualityIcon()}
            {getQualityLabel()}
            {confidenceScore > 0 && (
              <span className="ml-1">({confidenceScore}%)</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <pre className="text-xs whitespace-pre-wrap">{getTooltipContent()}</pre>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}