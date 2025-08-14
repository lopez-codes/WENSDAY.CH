import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  BarChart3,
  Target,
  Users,
  Brain
} from "lucide-react";
import QualityIndicator from "./quality-indicator";

interface BusinessDashboardProps {
  user: any;
  conversations: any[];
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
}

export default function BusinessDashboard({ 
  user, 
  conversations, 
  onNewConversation, 
  onSelectConversation 
}: BusinessDashboardProps) {
  
  // Business analytics queries
  const { data: analyticsData } = useQuery({
    queryKey: ["/api/business/analytics"],
    enabled: !!user,
    retry: false,
  });

  const getSubscriptionFeatures = () => {
    const tier = user?.subscriptionTier || 'free';
    switch (tier) {
      case 'pro':
        return {
          aiModels: 'Alle Premium AI-Modelle',
          qualityControl: 'Erweiterte Fehlererkennnung',
          analytics: 'Vollständige Business-Analytik',
          support: '24/7 Priority Support'
        };
      case 'ultra':
        return {
          aiModels: 'Standard AI-Modelle',
          qualityControl: 'Basis Fehlererkennnung',
          analytics: 'Basic Analytics',
          support: 'Email Support'
        };
      default:
        return {
          aiModels: 'Basis AI-Modell',
          qualityControl: 'Keine Qualitätskontrolle',
          analytics: 'Keine Analytics',
          support: 'Community Support'
        };
    }
  };

  const features = getSubscriptionFeatures();

  const getRecentConversations = () => {
    return conversations
      .filter(conv => !conv.isArchived)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  };

  const getConversationsByCategory = () => {
    const categories: { [key: string]: number } = {};
    conversations.forEach(conv => {
      const category = conv.businessType || 'general';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  };

  const getPriorityConversations = () => {
    return conversations.filter(conv => 
      conv.priority === 'high' || conv.priority === 'urgent'
    ).slice(0, 3);
  };

  return (
    <div className="space-y-6">
      {/* Business Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-lopez-green" />
              <div>
                <p className="text-sm text-swiss-gray">Gespräche</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-swiss-gray">AI-Qualität</p>
                <p className="text-2xl font-bold">
                  {(analyticsData as any)?.averageConfidence || '85'}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-swiss-gray">Business-Typ</p>
                <p className="text-sm font-medium capitalize">
                  {user?.industry || 'Nicht definiert'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-swiss-gray">Plan</p>
                <Badge variant="outline" className="text-xs capitalize">
                  {user?.subscriptionTier || 'free'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations">Gespräche</TabsTrigger>
          <TabsTrigger value="quality">Qualitätskontrolle</TabsTrigger>
          <TabsTrigger value="analytics">Business Analytics</TabsTrigger>
          <TabsTrigger value="features">Plan-Features</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Conversations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktuelle Gespräche</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getRecentConversations().map(conversation => (
                  <div 
                    key={conversation.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium truncate">{conversation.title}</p>
                        <p className="text-xs text-swiss-gray">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {conversation.businessType && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.businessType}
                          </Badge>
                        )}
                        {conversation.priority && conversation.priority !== 'medium' && (
                          <Badge 
                            variant={conversation.priority === 'urgent' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {conversation.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  onClick={onNewConversation}
                >
                  Neues Gespräch starten
                </Button>
              </CardContent>
            </Card>

            {/* Priority Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Prioritäten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getPriorityConversations().length > 0 ? (
                  getPriorityConversations().map(conversation => (
                    <div 
                      key={conversation.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate flex-1">{conversation.title}</p>
                        <Badge 
                          variant={conversation.priority === 'urgent' ? 'destructive' : 'secondary'}
                          className="text-xs ml-2"
                        >
                          {conversation.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-swiss-gray italic">
                    Keine priorisierten Gespräche
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>AI-Qualitätskontrolle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Verifizierte Antworten</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(analyticsData as any)?.verifiedResponses || '12'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Prüfung erforderlich</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {(analyticsData as any)?.needsReview || '3'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium">Fehler erkannt</p>
                      <p className="text-2xl font-bold text-red-600">
                        {(analyticsData as any)?.errorsDetected || '1'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">Qualitätseinstellungen</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Fehlertoleranz:</span>
                    <Badge variant="outline">{user?.errorToleranceLevel || 'Medium'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Automatische Faktenchecks:</span>
                    <Badge variant={user?.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                      {user?.subscriptionTier === 'pro' ? 'Aktiv' : 'Nicht verfügbar'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Business Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {user?.subscriptionTier === 'free' ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-swiss-gray mb-4" />
                  <p className="text-swiss-gray mb-4">
                    Business Analytics sind in Ihrem Plan nicht verfügbar
                  </p>
                  <Button 
                    className="bg-lopez-green hover:bg-lopez-green-dark"
                    onClick={() => window.location.href = '/subscribe'}
                  >
                    Plan upgraden
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Gespräche nach Kategorie</h3>
                      <div className="space-y-2">
                        {Object.entries(getConversationsByCategory()).map(([category, count]) => (
                          <div key={category} className="flex justify-between">
                            <span className="text-sm capitalize">{category}:</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Durchschnittliche Qualität</h3>
                      <div className="text-3xl font-bold text-lopez-green">
                        {(analyticsData as any)?.averageConfidence || '85'}%
                      </div>
                      <p className="text-xs text-swiss-gray">
                        Vertrauenswert der AI-Antworten
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Ihr {user?.subscriptionTier || 'free'} Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {Object.entries(features).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-sm text-swiss-gray">{value}</span>
                  </div>
                ))}
              </div>

              {user?.subscriptionTier === 'free' && (
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full bg-lopez-green hover:bg-lopez-green-dark"
                    onClick={() => window.location.href = '/subscribe'}
                  >
                    Auf Pro upgraden für erweiterte Business-Features
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}