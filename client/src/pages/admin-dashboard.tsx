import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Users, Activity, Shield, Settings, Eye, Edit, Trash2, Crown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

interface SystemStats {
  totalUsers: number;
  subscriptionCounts: Record<string, number>;
  coreUsers: number;
  adminUsers: number;
  messagesToday: number;
  totalConversations: number;
  activeUsers: number;
}

interface AdminLog {
  id: string;
  action: string;
  targetUserId: string | null;
  details: any;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Check admin access
  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Zugriff verweigert</h3>
              <p className="text-muted-foreground">Admin-Berechtigung erforderlich</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<SystemStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery<AdminLog[]>({
    queryKey: ["/api/admin/logs"],
    enabled: !!user?.isAdmin,
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) =>
      apiRequest(`/api/admin/users/${userId}`, "PATCH", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setEditDialogOpen(false);
      setSelectedUser(null);
    },
  });

  const toggleCoreAccessMutation = useMutation({
    mutationFn: ({ userId, activate }: { userId: string; activate: boolean }) =>
      apiRequest(`/api/admin/core-access/${userId}`, "POST", { activate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleSaveUser = (formData: FormData) => {
    if (!selectedUser) return;

    const updates = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      subscriptionTier: formData.get("subscriptionTier") as string,
      companyName: formData.get("companyName") as string,
      jobTitle: formData.get("jobTitle") as string,
    };

    updateUserMutation.mutate({ userId: selectedUser.id, updates });
  };

  const getSubscriptionBadge = (tier: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      free: "outline",
      ultra: "secondary",
      pro: "default",
      wensday_core: "destructive",
    };
    return (
      <Badge variant={variants[tier] || "outline"}>
        {tier === "wensday_core" ? "CORE" : tier.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-CH");
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            wensday.ch Plattform-Verwaltung • Admin ID: {user?.adminId || "N/A"}
          </p>
        </div>
        <Badge variant="destructive" className="flex items-center gap-2">
          <Crown className="h-4 w-4" />
          {user?.adminLevel?.toUpperCase() || "ADMIN"}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Benutzer
          </TabsTrigger>
          <TabsTrigger value="core" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            wensday-core
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="card-total-users">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gesamt Benutzer</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeUsers || 0} aktiv (7 Tage)
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-core-users">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Core Benutzer</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.coreUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Premium Developer Access
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-messages-today">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nachrichten Heute</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.messagesToday || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalConversations || 0} Gespräche gesamt
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-subscriptions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Free:</span>
                    <span>{stats?.subscriptionCounts?.free || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ultra:</span>
                    <span>{stats?.subscriptionCounts?.ultra || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pro:</span>
                    <span>{stats?.subscriptionCounts?.pro || 0}</span>
                  </div>
                  <div className="flex justify-between font-bold text-red-600">
                    <span>Core:</span>
                    <span>{stats?.subscriptionCounts?.wensday_core || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benutzer-Verwaltung</CardTitle>
              <CardDescription>
                Alle registrierten Benutzer anzeigen und verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Lade Benutzer...</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Benutzer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Core Access</TableHead>
                      <TableHead>Registriert</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(users as User[]).map((user: User) => (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ""} ${user.lastName || ""}`
                                : "Unbekannt"}
                            </div>
                            {user.isAdmin && (
                              <Badge variant="destructive" className="text-xs mt-1">
                                Admin {user.adminId}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-email-${user.id}`}>
                          {user.email || "N/A"}
                        </TableCell>
                        <TableCell>
                          {getSubscriptionBadge(user.subscriptionTier || "free")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.hasCoreAccess ? (
                              <Badge variant="destructive">✓ AKTIV</Badge>
                            ) : (
                              <Badge variant="outline">Inaktiv</Badge>
                            )}
                            {user?.canManageCore && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  toggleCoreAccessMutation.mutate({
                                    userId: user.id,
                                    activate: !user.hasCoreAccess,
                                  })
                                }
                                disabled={toggleCoreAccessMutation.isPending}
                                data-testid={`button-toggle-core-${user.id}`}
                              >
                                {user.hasCoreAccess ? "Deaktivieren" : "Aktivieren"}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell data-testid={`text-created-${user.id}`}>
                          {user.createdAt ? formatDate(user.createdAt.toString()) : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              data-testid={`button-edit-${user.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="core" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                wensday-core Management
              </CardTitle>
              <CardDescription>
                Exklusive Premium Developer Access-Verwaltung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(users as User[])
                  .filter((user: User) => user.hasCoreAccess)
                  .map((user: User) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`core-user-${user.id}`}
                    >
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="destructive">Core Access</Badge>
                          <Badge variant="outline">
                            API Key: {user.coreApiKey ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            toggleCoreAccessMutation.mutate({
                              userId: user.id,
                              activate: false,
                            })
                          }
                          disabled={toggleCoreAccessMutation.isPending}
                          data-testid={`button-revoke-core-${user.id}`}
                        >
                          Core Access entziehen
                        </Button>
                      </div>
                    </div>
                  ))}

                {(users as User[]).filter((user: User) => user.hasCoreAccess).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine wensday-core Benutzer aktiv
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Aktivitäts-Logs</CardTitle>
              <CardDescription>
                Alle Admin-Aktionen werden hier protokolliert
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">Lade Logs...</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zeitstempel</TableHead>
                      <TableHead>Aktion</TableHead>
                      <TableHead>Ziel-Benutzer</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} data-testid={`log-${log.id}`}>
                        <TableCell>
                          {new Date(log.createdAt).toLocaleString("de-CH")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.targetUserId || "N/A"}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Benutzerinformationen und Subscription verwalten
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveUser(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={selectedUser.firstName || ""}
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={selectedUser.lastName || ""}
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                <Select name="subscriptionTier" defaultValue={selectedUser.subscriptionTier || "free"}>
                  <SelectTrigger data-testid="select-subscription">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="ultra">Ultra</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="wensday_core">wensday-core</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="companyName">Unternehmen</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  defaultValue={selectedUser.companyName || ""}
                  data-testid="input-company"
                />
              </div>
              <div>
                <Label htmlFor="jobTitle">Position</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  defaultValue={selectedUser.jobTitle || ""}
                  data-testid="input-job-title"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  data-testid="button-save-user"
                >
                  {updateUserMutation.isPending ? "Speichern..." : "Speichern"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}