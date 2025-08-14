import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Trash2 } from "lucide-react";
import QualityIndicator from "@/components/business/quality-indicator";
import type { Message, Conversation } from "@shared/schema";

interface SimpleChatProps {
  conversationId?: string | null;
  existingMessages?: Message[];
  onNewConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export default function SimpleChat({ 
  conversationId, 
  existingMessages = [], 
  onNewConversation,
  onDeleteConversation 
}: SimpleChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setMessages(existingMessages);
  }, [existingMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async ({ message, conversationId }: { message: string; conversationId?: string }) => {
      const response = await apiRequest("POST", "/api/chat", { message, conversationId });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data.message]);
      if (!conversationId && onNewConversation) {
        onNewConversation(data.conversationId);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Nachricht konnte nicht gesendet werden",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await apiRequest("DELETE", `/api/conversations/${conversationId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (onDeleteConversation && conversationId) {
        onDeleteConversation(conversationId);
      }
      toast({
        title: "Erfolg",
        description: "Gespräch wurde gelöscht",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Gespräch konnte nicht gelöscht werden",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatMutation.isPending) return;

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      conversationId: conversationId || 'new',
      role: "user",
      content: message,
      createdAt: new Date(),
      aiModel: null,
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate({ message, conversationId });
    setMessage("");
  };

  const handleDelete = () => {
    if (conversationId && window.confirm('Möchten Sie dieses Gespräch wirklich löschen?')) {
      deleteMutation.mutate(conversationId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with delete button */}
      {conversationId && (
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Chat mit Gemini AI</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Löschen
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={`${msg.id}-${index}`}
            className={`flex items-start space-x-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 bg-[hsl(129.4118,100%,27.0588%)] rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <Card className={`max-w-[80%] p-3 ${
              msg.role === "user" 
                ? "bg-[hsl(129.4118,100%,27.0588%)] text-white" 
                : "bg-gray-50 dark:bg-gray-800"
            }`}>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              
              {/* Quality Control for AI Messages */}
              {msg.role === "assistant" && (msg as any).confidenceScore && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <QualityIndicator
                    hasErrors={(msg as any).hasErrors}
                    confidenceScore={(msg as any).confidenceScore}
                    needsReview={(msg as any).needsReview}
                    factChecked={(msg as any).factChecked}
                    errorDetails={(msg as any).errorDetails}
                    businessCategory={(msg as any).businessCategory}
                  />
                </div>
              )}
            </Card>

            {msg.role === "user" && (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[hsl(129.4118,100%,27.0588%)] rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <Card className="bg-gray-50 dark:bg-gray-800 p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Stellen Sie eine Frage auf Deutsch..."
            disabled={chatMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || chatMutation.isPending}
            className="bg-[hsl(129.4118,100%,27.0588%)] hover:bg-[hsl(129.4118,100%,22%)] text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Gemini 2.5 Flash • Schweizer KI-Assistent • {user ? `${(user as any)?.dailyMessageCount || 0}/10 Nachrichten heute` : ''}
        </div>
      </div>
    </div>
  );
}