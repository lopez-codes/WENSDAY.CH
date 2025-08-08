import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, Mic, Brain, Zap, Crown } from "lucide-react";
import type { Message } from "@shared/schema";

interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  pricing: 'free' | 'paid' | 'freemium';
  capabilities: string[];
  contextWindow?: number;
}

interface ChatInterfaceProps {
  isDemo?: boolean;
  conversationId?: string | null;
  existingMessages?: Message[];
  onNewConversation?: (id: string) => void;
}

export default function ChatInterface({ 
  isDemo = false, 
  conversationId, 
  existingMessages = [],
  onNewConversation 
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available AI models
  const { data: aiData } = useQuery({
    queryKey: ['/api/ai-models'],
    enabled: !!user && !isDemo,
  });

  const availableModels: AIModel[] = aiData?.models || [];
  const userTier = aiData?.userTier || 'free';

  useEffect(() => {
    if (existingMessages && existingMessages.length !== messages.length) {
      setMessages(existingMessages);
    }
  }, [existingMessages, messages.length]);

  // Set default model when models are loaded
  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      // Select the first premium model for paid users, first free model otherwise
      const defaultModel = userTier === 'pro' 
        ? availableModels.find(m => m.provider === 'google') || availableModels[0]
        : availableModels.find(m => m.pricing === 'free') || availableModels[0];
      setSelectedModel(defaultModel.id);
    }
  }, [availableModels, selectedModel, userTier]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const chatMutation = useMutation({
    mutationFn: async ({ message, conversationId, selectedModel }: { message: string; conversationId?: string; selectedModel?: string }) => {
      const response = await apiRequest("POST", "/api/chat", { message, conversationId, selectedModel });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data.message]);
      if (!conversationId && onNewConversation) {
        onNewConversation(data.conversationId);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isDemo || chatMutation.isPending) return;

    // Add user message immediately
    const userMessage: Message = {
      id: 'temp-' + Date.now(),
      conversationId: conversationId || '',
      role: 'user',
      content: message.trim(),
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    chatMutation.mutate({ 
      message: message.trim(), 
      conversationId: conversationId || undefined,
      selectedModel: selectedModel || undefined
    });
    
    setMessage("");
  };

  // Demo messages for landing page
  const demoMessages: Message[] = [
    {
      id: '1',
      conversationId: 'demo',
      role: 'assistant',
      content: 'Grüezi! How can I assist you today with your research or questions?',
      createdAt: new Date(),
    },
    {
      id: '2',
      conversationId: 'demo',
      role: 'user',
      content: 'Can you analyze Swiss market trends for AI adoption?',
      createdAt: new Date(),
    },
    {
      id: '3',
      conversationId: 'demo',
      role: 'assistant',
      content: 'Based on recent data, Swiss companies are showing strong AI adoption rates, particularly in finance and manufacturing sectors. The Swiss government\'s digital strategy and strong data protection laws create an ideal environment for AI innovation.',
      aiModel: 'gemini-2.5-flash',
      createdAt: new Date(),
    },
  ];

  const displayMessages = isDemo ? demoMessages : messages;
  const currentUser = user;

  // Helper functions
  const getModelDisplayName = () => {
    if (isDemo) return "Google Gemini";
    if (!selectedModel) return "Loading...";
    const model = availableModels.find(m => m.id === selectedModel);
    return model ? model.name : "AI Model";
  };

  const getModelIcon = (model: AIModel) => {
    if (model.pricing === 'free') {
      return <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">Free</Badge>;
    } else if (model.pricing === 'freemium') {
      return <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">Freemium</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200">Premium</Badge>;
    }
  };

  const getModelBadge = (modelId: string) => {
    const model = availableModels.find(m => m.id === modelId);
    if (!model) return null;

    if (model.provider === 'google') {
      return <Badge className="text-xs bg-blue-50 text-blue-600">🚀 Google Gemini</Badge>;
    } else if (model.provider === 'deepseek') {
      return <Badge className="text-xs bg-purple-50 text-purple-600">🧠 DeepSeek</Badge>;
    } else if (model.provider === 'openrouter') {
      return <Badge className="text-xs bg-orange-50 text-orange-600">🌐 OpenRouter</Badge>;
    } else if (model.provider === 'huggingface') {
      return <Badge className="text-xs bg-yellow-50 text-yellow-600">🤗 HuggingFace</Badge>;
    }
    return <Badge className="text-xs bg-gray-50 text-gray-600">🤖 {model.provider}</Badge>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-lopez-green to-green-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Swiss AI Multiverse</h3>
              <p className="text-green-100 text-sm">{getModelDisplayName()} • Multi-Provider AI</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
            <span className="text-sm">Live</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {displayMessages.length === 0 ? (
          <div className="text-center text-swiss-gray py-12">
            <Bot className="w-16 h-16 mx-auto mb-4 text-lopez-green" />
            <h3 className="text-xl font-semibold mb-2">Welcome to Swiss AI Chat</h3>
            <p>Start a conversation to experience intelligent AI assistance with Swiss precision.</p>
          </div>
        ) : (
          displayMessages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 bg-lopez-green rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-md lg:max-w-lg p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-lopez-green text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                {msg.role === 'assistant' && msg.aiModel && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      🇨🇭 Swiss AI
                    </Badge>
                    {getModelBadge(msg.aiModel)}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  {currentUser?.profileImageUrl ? (
                    <img
                      src={currentUser.profileImageUrl}
                      alt="User"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-lopez-green rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-lopez-green rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-lopez-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-lopez-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Model Selection & Input Area */}
      <div className="p-6 border-t border-gray-200 bg-white">
        {/* AI Model Selector */}
        {!isDemo && availableModels.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">AI Model:</label>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Zap className="w-3 h-3" />
                <span>{availableModels.filter(m => m.pricing === 'free').length} kostenlose</span>
                <Crown className="w-3 h-3 ml-2" />
                <span>{availableModels.filter(m => m.pricing !== 'free').length} premium</span>
              </div>
            </div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wählen Sie ein AI-Modell..." />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{model.name}</span>
                          {getModelIcon(model)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{model.description}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder={isDemo ? "This is a demo - sign in to chat!" : "Ask me anything about Swiss business, technology, or research..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isDemo || chatMutation.isPending}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lopez-green focus:border-transparent"
          />
          <Button
            type="submit"
            disabled={isDemo || !message.trim() || chatMutation.isPending}
            className="bg-lopez-green text-white p-3 rounded-xl hover:bg-lopez-green-dark transition-colors"
          >
            <Send className="w-5 h-5" />
          </Button>
          <Button
            type="button"
            disabled={isDemo}
            variant="outline"
            className="p-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Mic className="w-5 h-5" />
          </Button>
        </form>
        
        <div className="mt-4 flex items-center justify-between text-sm text-swiss-gray">
          <div className="flex items-center space-x-4">
            <span>Multi-AI Platform: {isDemo ? 'Gemini' : getModelDisplayName()}</span>
            <span>•</span>
            <span>Swiss Data Protection</span>
          </div>
          {currentUser && !isDemo && (
            <span>
              {currentUser.subscriptionTier === 'free' 
                ? `${currentUser.dailyMessageCount || 0}/10 daily questions remaining`
                : currentUser.subscriptionTier === 'ultra'
                ? `${currentUser.dailyMessageCount || 0}/500 daily questions`
                : 'Unlimited questions'
              }
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
