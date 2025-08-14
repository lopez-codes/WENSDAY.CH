import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  PlusCircle, 
  Send, 
  User, 
  Bot, 
  MoreVertical,
  Trash2,
  Edit3,
  MessageSquare,
  Crown,
  Zap,
  Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message, Conversation } from "@shared/schema";

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
  }) as { data: Conversation[] };

  // Fetch messages for selected conversation  
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversationId, "messages"],
    enabled: !!selectedConversationId,
  }) as { data: Message[] };

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: "Neues Gespräch"
      });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversationId(newConversation.id);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversationId) {
        throw new Error("Keine Unterhaltung ausgewählt");
      }
      
      setIsGenerating(true);
      const response = await apiRequest("POST", `/api/conversations/${selectedConversationId}/messages`, {
        content,
        role: "user"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", selectedConversationId, "messages"] 
      });
      setNewMessage("");
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden.",
        variant: "destructive",
      });
    },
  });

  // Delete conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest("DELETE", `/api/conversations/${conversationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (selectedConversationId === selectedConversationId) {
        setSelectedConversationId(null);
      }
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || isGenerating) return;
    
    if (!selectedConversationId) {
      // Create new conversation first
      createConversationMutation.mutate();
      return;
    }
    
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserTier = () => {
    const tier = (user as any)?.subscriptionTier || 'free';
    switch (tier) {
      case 'pro': return { label: 'Pro', icon: Crown, color: 'text-yellow-500' };
      case 'ultra': return { label: 'Ultra', icon: Zap, color: 'text-purple-500' };
      default: return { label: 'Free', icon: Star, color: 'text-gray-500' };
    }
  };

  const userTier = getUserTier();

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Button
            onClick={() => createConversationMutation.mutate()}
            className="w-full justify-start gap-2 bg-lopez-green hover:bg-lopez-green-dark"
            disabled={createConversationMutation.isPending}
          >
            <PlusCircle className="w-4 h-4" />
            Neues Gespräch
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 p-2">
          {conversations.map((conversation: Conversation) => (
            <div
              key={conversation.id}
              className={`group p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                selectedConversationId === conversation.id
                  ? 'bg-gray-200'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedConversationId(conversation.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleDateString('de-CH') : ''}
                  </p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Umbenennen
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => deleteConversationMutation.mutate(conversation.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {(user as any)?.profileImageUrl ? (
              <img 
                src={(user as any).profileImageUrl} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-lopez-green rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {(user as any)?.firstName || (user as any)?.email}
              </p>
              <div className="flex items-center gap-1">
                <userTier.icon className={`w-3 h-3 ${userTier.color}`} />
                <span className={`text-xs ${userTier.color}`}>{userTier.label}</span>
              </div>
            </div>
          </div>
          
          {/* Minimal branding */}
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-400">KI-Chat</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message: Message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-lopez-green rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[70%] ${
                      message.role === 'user' 
                        ? 'bg-lopez-green text-white' 
                        : 'bg-gray-100 text-gray-900'
                    } rounded-2xl px-4 py-3`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Quality indicators for assistant messages */}
                      {message.role === 'assistant' && (
                        <div className="flex gap-2 mt-2">
                          {message.confidenceScore && (
                            <Badge variant="outline" className="text-xs">
                              {message.confidenceScore}% sicher
                            </Badge>
                          )}
                          {message.isVerified && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Verifiziert
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isGenerating && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 bg-lopez-green rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Nachricht eingeben..."
                      disabled={isGenerating}
                      className="min-h-[44px] resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isGenerating}
                    className="bg-lopez-green hover:bg-lopez-green-dark h-11 w-11 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-lopez-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Willkommen
              </h2>
              <p className="text-gray-600 mb-6">
                Starten Sie ein neues Gespräch oder wählen Sie eine bestehende Unterhaltung aus.
              </p>
              <Button
                onClick={() => createConversationMutation.mutate()}
                className="bg-lopez-green hover:bg-lopez-green-dark"
                disabled={createConversationMutation.isPending}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Neues Gespräch starten
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}