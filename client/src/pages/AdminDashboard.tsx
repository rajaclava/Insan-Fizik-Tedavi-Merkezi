import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Calendar, MessageSquare, LogOut, User, Phone, Mail, Clock } from "lucide-react";
import type { Appointment, ContactMessage } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  const { data: contactMessages, isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact"],
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
      setLocation("/admin/login");
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız",
      });
    },
  });

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pendingAppointments = appointments?.filter(a => a.status === "pending") || [];
  const unreadMessages = contactMessages || [];

  return (
    <div className="min-h-screen bg-muted">
      <SEO
        title="Yönetim Paneli"
        description="İnsan Fizik Tedavi Yönetim Paneli"
        path="/admin"
      />
      
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Yönetim Paneli</h1>
              <p className="text-sm text-muted-foreground">
                Hoş geldiniz, {user.username}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {pendingAppointments.length} beklemede
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">İletişim Mesajları</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadMessages.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Toplam mesaj
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Admin
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Son Randevular</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <p className="text-muted-foreground">Yükleniyor...</p>
              ) : appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-start justify-between p-4 border rounded-md"
                      data-testid={`appointment-${appointment.id}`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{appointment.name}</p>
                          <Badge variant={appointment.status === "pending" ? "secondary" : "default"}>
                            {appointment.status === "pending" ? "Beklemede" : appointment.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {appointment.phone}
                          </div>
                          {appointment.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {appointment.email}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {appointment.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {appointment.time}
                          </div>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Hizmet:</span> {appointment.service}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Henüz randevu yok</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son İletişim Mesajları</CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <p className="text-muted-foreground">Yükleniyor...</p>
              ) : contactMessages && contactMessages.length > 0 ? (
                <div className="space-y-4">
                  {contactMessages.slice(0, 5).map((message) => (
                    <div
                      key={message.id}
                      className="p-4 border rounded-md"
                      data-testid={`message-${message.id}`}
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{message.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {message.phone}
                          </div>
                          {message.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {message.email}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Henüz mesaj yok</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
