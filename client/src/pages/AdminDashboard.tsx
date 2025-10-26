import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  Calendar,
  MessageSquare,
  LogOut,
  User,
  Phone,
  Mail,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
} from "lucide-react";
import type { Appointment, ContactMessage } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);

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

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/appointments/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Durum Güncellendi",
        description: "Randevu durumu başarıyla güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Durum güncellenirken hata oluştu",
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setDeleteAppointmentId(null);
      toast({
        title: "Silindi",
        description: "Randevu başarıyla silindi",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/contact/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      setDeleteMessageId(null);
      toast({
        title: "Silindi",
        description: "Mesaj başarıyla silindi",
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

  const filteredAppointments = appointments?.filter((appointment) => {
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      appointment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.phone.includes(searchQuery) ||
      (appointment.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingAppointments = appointments?.filter((a) => a.status === "pending") || [];
  const unreadMessages = contactMessages || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "Beklemede" },
      approved: { variant: "default", label: "Onaylandı" },
      cancelled: { variant: "destructive", label: "İptal Edildi" },
      completed: { variant: "default", label: "Tamamlandı" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
              <p className="text-sm text-muted-foreground">Hoş geldiniz, {user.username}</p>
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
              <CardTitle className="text-sm font-medium">Toplam Randevu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-appointments">
                {appointments?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {pendingAppointments.length} beklemede
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
              <CardTitle className="text-sm font-medium">İletişim Mesajları</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-messages">
                {unreadMessages.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Toplam mesaj</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
              <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Admin</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Randevular</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-full sm:w-[200px]"
                      data-testid="input-search-appointments"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                      <SelectValue placeholder="Durum Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="approved">Onaylandı</SelectItem>
                      <SelectItem value="cancelled">İptal Edildi</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <p className="text-muted-foreground">Yükleniyor...</p>
              ) : filteredAppointments && filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-start justify-between p-4 border rounded-md hover-elevate"
                      data-testid={`appointment-${appointment.id}`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{appointment.name}</p>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAppointment(appointment)}
                          data-testid={`button-view-${appointment.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {appointment.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: appointment.id,
                                  status: "approved",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-approve-${appointment.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: appointment.id,
                                  status: "cancelled",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-cancel-${appointment.id}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteAppointmentId(appointment.id)}
                          data-testid={`button-delete-${appointment.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" ? "Sonuç bulunamadı" : "Henüz randevu yok"}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>İletişim Mesajları</CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <p className="text-muted-foreground">Yükleniyor...</p>
              ) : contactMessages && contactMessages.length > 0 ? (
                <div className="space-y-4">
                  {contactMessages.map((message) => (
                    <div
                      key={message.id}
                      className="p-4 border rounded-md hover-elevate"
                      data-testid={`message-${message.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="font-medium">{message.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteMessageId(message.id)}
                          className="ml-4"
                          data-testid={`button-delete-message-${message.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent data-testid="dialog-appointment-detail">
          <DialogHeader>
            <DialogTitle>Randevu Detayları</DialogTitle>
            <DialogDescription>
              {selectedAppointment?.createdAt &&
                `Oluşturulma: ${new Date(selectedAppointment.createdAt).toLocaleString("tr-TR")}`}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Hasta Adı</label>
                <p className="text-sm text-muted-foreground">{selectedAppointment.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Telefon</label>
                <p className="text-sm text-muted-foreground">{selectedAppointment.phone}</p>
              </div>
              {selectedAppointment.email && (
                <div>
                  <label className="text-sm font-medium">E-posta</label>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.email}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Hizmet</label>
                <p className="text-sm text-muted-foreground">{selectedAppointment.service}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tarih</label>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Saat</label>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.time}</p>
                </div>
              </div>
              {selectedAppointment.message && (
                <div>
                  <label className="text-sm font-medium">Mesaj</label>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.message}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Durum</label>
                <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedAppointment.status}
                  onValueChange={(newStatus) => {
                    updateStatusMutation.mutate({
                      id: selectedAppointment.id,
                      status: newStatus,
                    });
                    setSelectedAppointment(null);
                  }}
                >
                  <SelectTrigger data-testid="select-change-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="approved">Onayla</SelectItem>
                    <SelectItem value="cancelled">İptal Et</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteAppointmentId} onOpenChange={() => setDeleteAppointmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Randevuyu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAppointmentId && deleteAppointmentMutation.mutate(deleteAppointmentId)}
              data-testid="button-confirm-delete"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteMessageId} onOpenChange={() => setDeleteMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mesajı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu mesajı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMessageId && deleteMessageMutation.mutate(deleteMessageId)}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
