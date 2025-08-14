import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SimpleChat from "@/components/chat/simple-chat";
import BusinessDashboard from "@/components/business/business-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Plus, User, CreditCard, Building, LayoutDashboard } from "lucide-react";
import type { Conversation, User as UserType } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user,
    retry: false,
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
    retry: false,
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getRateLimit = () => {
    switch ((user as any)?.subscriptionTier) {
      case 'ultra': return 500;
      case 'pro': return -1; // unlimited
      default: return 10;
    }
  };

  const getUsedMessages = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastMessageDate = (user as any)?.lastMessageDate ? new Date((user as any).lastMessageDate) : null;
    
    if (!lastMessageDate || lastMessageDate < today) {
      return 0;
    }
    return (user as any)?.dailyMessageCount || 0;
  };

  const limit = getRateLimit();
  const used = getUsedMessages();
  const remaining = limit > 0 ? Math.max(0, limit - used) : -1;

  return (
    <div className="min-h-screen bg-swiss-light">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business vs Chat Mode Toggle */}
        <div className="mb-6">
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Business Dashboard
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                AI Chat
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="business" className="mt-6">
              <BusinessDashboard
                user={user}
                conversations={conversations as any[]}
                onNewConversation={() => setSelectedConversation(null)}
                onSelectConversation={(id) => setSelectedConversation(id)}
              />
            </TabsContent>
            
            <TabsContent value="chat" className="mt-6">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                  {/* User Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        {(user as any)?.profileImageUrl ? (
                          <img
                            src={(user as any).profileImageUrl}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-lopez-green rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{(user as any)?.firstName} {(user as any)?.lastName}</p>
                          <p className="text-sm text-swiss-gray">{(user as any)?.email}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-swiss-gray">Plan:</span>
                          <span className="text-sm font-medium capitalize">
                            {(user as any)?.subscriptionTier || 'free'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-swiss-gray">Daily Messages:</span>
                          <span className="text-sm font-medium">
                            {remaining === -1 ? 'Unlimited' : `${used}/${limit}`}
                          </span>
                        </div>
                      </div>

                      {((user as any)?.subscriptionTier === 'free' || !(user as any)?.subscriptionTier) && (
                        <Button 
                          className="w-full bg-lopez-green hover:bg-lopez-green-dark"
                          onClick={() => window.location.href = '/subscribe'}
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Conversations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-5 h-5" />
                          <span>Conversations</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedConversation(null)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(conversations as any[])?.length === 0 ? (
                          <p className="text-sm text-swiss-gray">No conversations yet</p>
                        ) : (
                          (conversations as any[])?.map((conversation: any) => (
                            <button
                              key={conversation.id}
                              onClick={() => setSelectedConversation(conversation.id)}
                              className={`w-full text-left p-3 rounded-lg transition-colors ${
                                selectedConversation === conversation.id
                                  ? 'bg-lopez-green text-white'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              <p className="font-medium truncate">{conversation.title}</p>
                              <p className="text-xs opacity-75">
                                {new Date(conversation.updatedAt!).toLocaleDateString()}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Chat Area */}
                <div className="lg:col-span-3">
                  <Card className="h-[700px]">
                    <CardContent className="p-0 h-full">
                      <SimpleChat 
                        conversationId={selectedConversation}
                        existingMessages={messages as any}
                        onNewConversation={(id) => {
                          setSelectedConversation(id);
                          queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
                        }}
                        onDeleteConversation={() => {
                          setSelectedConversation(null);
                          queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
