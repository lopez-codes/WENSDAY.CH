import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Mic } from "lucide-react";
import type { Message } from "@shared/schema";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (existingMessages && existingMessages.length !== messages.length) {
      setMessages(existingMessages);
    }
  }, [existingMessages, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      conversationId: conversationId || undefined 
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
              <p className="text-green-100 text-sm">Google Gemini • Independent Research</p>
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
                  <div className="mt-3 flex space-x-2">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                      🇨🇭 Swiss AI
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                      🔬 {msg.aiModel === 'gemini-2.5-pro' ? 'Pro Model' : 'Research'}
                    </span>
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

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200 bg-white">
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
            <span>Powered by Google Gemini</span>
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
