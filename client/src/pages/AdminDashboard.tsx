import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
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
  FileText,
  Star,
  Users,
  Stethoscope,
  Package,
  ShoppingCart,
  ClipboardList,
  Activity,
  Shield,
} from "lucide-react";
import type { Appointment, ContactMessage } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";
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
    <AdminLayout>
      <SEO
        title="Yönetim Paneli"
        description="İnsan Fizik Tedavi Yönetim Paneli"
        path="/admin"
      />

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Ana Panel</h1>
          <p className="text-muted-foreground">Hoş geldiniz, Admin</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Randevular</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Onay bekliyor</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yeni Mesajlar</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadMessages.length}</div>
              <p className="text-xs text-muted-foreground">Okunmamış</p>
            </CardContent>
          </Card>

          <Link href="/admin/patients">
            <Card className="hover-elevate cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hastalar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Hasta yönetimi</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/therapists">
            <Card className="hover-elevate cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fizyoterapistler</CardTitle>
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Terapist yönetimi</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/blog">
            <Card className="hover-elevate cursor-pointer" data-testid="link-blog">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Blog Yönetimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Blog yazılarını oluştur ve düzenle
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/testimonials">
            <Card className="hover-elevate cursor-pointer" data-testid="link-testimonials">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Yorumlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Hasta yorumlarını onayla veya sil
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/packages">
            <Card className="hover-elevate cursor-pointer" data-testid="link-packages">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Paketler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tedavi paketlerini yönet
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/treatment-plans">
            <Card className="hover-elevate cursor-pointer" data-testid="link-treatment-plans">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Tedavi Planları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Hasta tedavi planlarını yönet
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/session-notes">
            <Card className="hover-elevate cursor-pointer" data-testid="link-session-notes">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Seans Notları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Terapi seanslarını kaydet
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover-elevate cursor-pointer" data-testid="link-users">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Kullanıcı Yönetimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Admin ve terapist kullanıcılarını yönet
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Son Randevular</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <p className="text-muted-foreground">Yükleniyor...</p>
              ) : filteredAppointments && filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.slice(0, 5).map((appointment) => (
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
                            {appointment.startTime}
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
                  <p className="text-sm text-muted-foreground">{selectedAppointment.startTime}</p>
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
    </AdminLayout>
  );
}
