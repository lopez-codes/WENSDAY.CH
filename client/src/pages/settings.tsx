import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Brain, Lock, Save, CreditCard, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(8, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Schema for AI preferences
const aiPreferencesSchema = z.object({
  defaultModel: z.string().min(1, "Please select a default model"),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(100).max(8192),
  systemPrompt: z.string().optional(),
});

// Schema for profile updates
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

type PasswordForm = z.infer<typeof passwordSchema>;
type AIPreferencesForm = z.infer<typeof aiPreferencesSchema>;
type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch current AI preferences (mock data for now)
  const { data: aiPreferences } = useQuery({
    queryKey: ["/api/user/ai-preferences"],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      // Mock data until backend is implemented
      return {
        defaultModel: "gemini-2.5-flash",
        temperature: 0.7,
        maxTokens: 4096,
        systemPrompt: "",
      };
    },
  });

  // Forms
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: (user as any)?.firstName || "",
      lastName: (user as any)?.lastName || "",
      email: (user as any)?.email || "",
    },
  });

  const aiPreferencesForm = useForm<AIPreferencesForm>({
    resolver: zodResolver(aiPreferencesSchema),
    defaultValues: {
      defaultModel: aiPreferences?.defaultModel || "gemini-2.5-flash",
      temperature: aiPreferences?.temperature || 0.7,
      maxTokens: aiPreferences?.maxTokens || 4096,
      systemPrompt: aiPreferences?.systemPrompt || "",
    },
  });

  // Update forms when data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: (user as any)?.firstName || "",
        lastName: (user as any)?.lastName || "",
        email: (user as any)?.email || "",
      });
    }
  }, [user, profileForm]);

  useEffect(() => {
    if (aiPreferences) {
      aiPreferencesForm.reset(aiPreferences);
    }
  }, [aiPreferences, aiPreferencesForm]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      // For now, just mock the response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      // Mock password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    },
  });

  const updateAIPreferencesMutation = useMutation({
    mutationFn: async (data: AIPreferencesForm) => {
      // Mock AI preferences update
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "AI Preferences Updated",
        description: "Your AI model preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/ai-preferences"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update AI preferences.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-swiss-light">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-8 h-8 text-lopez-green" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-swiss-gray">Manage your account and AI preferences</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Models</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal information and account details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            This email is used for login and notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="bg-lopez-green hover:bg-lopez-green-dark"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit((data) => changePasswordMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters long.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending}
                      className="bg-lopez-green hover:bg-lopez-green-dark"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Models Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>AI Model Preferences</span>
                </CardTitle>
                <CardDescription>
                  Configure your default AI model and generation settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...aiPreferencesForm}>
                  <form onSubmit={aiPreferencesForm.handleSubmit((data) => updateAIPreferencesMutation.mutate(data))} className="space-y-6">
                    <FormField
                      control={aiPreferencesForm.control}
                      name="defaultModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default AI Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gemini-2.5-flash">
                                <div className="flex items-center justify-between w-full">
                                  <span>Gemini 2.5 Flash</span>
                                  <Badge variant="secondary" className="ml-2">Fast</Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value="gemini-2.5-pro">
                                <div className="flex items-center justify-between w-full">
                                  <span>Gemini 2.5 Pro</span>
                                  <Badge variant="secondary" className="ml-2">Advanced</Badge>
                                </div>
                              </SelectItem>
                              {((user as any)?.subscriptionTier === 'pro') && (
                                <>
                                  <SelectItem value="deepseek/deepseek-r1:free">
                                    <div className="flex items-center justify-between w-full">
                                      <span>DeepSeek R1</span>
                                      <Badge variant="outline" className="ml-2">Free</Badge>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="google/gemini-2.0-flash:free">
                                    <div className="flex items-center justify-between w-full">
                                      <span>Gemini 2.0 Flash</span>
                                      <Badge variant="outline" className="ml-2">Free</Badge>
                                    </div>
                                  </SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your preferred AI model for chat conversations.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={aiPreferencesForm.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Creativity (Temperature)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                max="1" 
                                step="0.1"
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              0 = Focused, 1 = Creative
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={aiPreferencesForm.control}
                        name="maxTokens"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Response Length</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="100" 
                                max="8192"
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum tokens in responses
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={aiPreferencesForm.control}
                      name="systemPrompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom System Prompt (Optional)</FormLabel>
                          <FormControl>
                            <textarea 
                              {...field}
                              rows={4}
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                              placeholder="Enter custom instructions for the AI (e.g., 'Always respond in a professional tone')"
                            />
                          </FormControl>
                          <FormDescription>
                            Custom instructions that will be applied to all conversations.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={updateAIPreferencesMutation.isPending}
                      className="bg-lopez-green hover:bg-lopez-green-dark"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateAIPreferencesMutation.isPending ? "Saving..." : "Save AI Preferences"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Subscription Plan</span>
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold capitalize">{(user as any)?.subscriptionTier || 'free'} Plan</h3>
                    <p className="text-sm text-swiss-gray">
                      {((user as any)?.subscriptionTier === 'free' || !(user as any)?.subscriptionTier) && 'Free plan with 10 messages per day'}
                      {(user as any)?.subscriptionTier === 'ultra' && 'Ultra plan with 500 messages per day'}
                      {(user as any)?.subscriptionTier === 'pro' && 'Pro plan with unlimited messages'}
                    </p>
                  </div>
                  <Badge variant={(user as any)?.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                    {(user as any)?.subscriptionTier === 'pro' ? 'Premium' : (user as any)?.subscriptionTier || 'free'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-lopez-green">
                      {(user as any)?.subscriptionTier === 'pro' ? '∞' : (user as any)?.subscriptionTier === 'ultra' ? '500' : '10'}
                    </div>
                    <div className="text-sm text-swiss-gray">Daily Messages</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-lopez-green">
                      {(user as any)?.dailyMessageCount || 0}
                    </div>
                    <div className="text-sm text-swiss-gray">Used Today</div>
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
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}