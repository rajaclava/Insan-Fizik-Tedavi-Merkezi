import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Phone, Mail, Search, Eye, Trash2, CheckCircle2, XCircle, User } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { SEO } from "@/components/SEO";
import type { Appointment, User as UserType } from "@shared/schema";

export default function AdminAppointments() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(null);

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: therapists, isLoading: therapistsLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users/therapists"],
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appointment> }) =>
      apiRequest("PATCH", `/api/appointments/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Başarılı",
        description: "Randevu güncellendi",
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

  const filteredAppointments = appointments?.filter((appointment) => {
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      appointment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.phone.includes(searchQuery) ||
      (appointment.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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

  const getTherapistName = (therapistId: string | null) => {
    if (!therapistId) return "Atanmadı";
    const therapist = therapists?.find((t) => t.id === therapistId);
    return therapist ? therapist.username : "Bilinmiyor";
  };

  return (
    <AdminLayout>
      <SEO
        title="Randevu Yönetimi"
        description="İnsan Fizik Tedavi Randevu Yönetimi"
        path="/admin/appointments"
      />

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Randevu Yönetimi</h1>
          <p className="text-muted-foreground">Randevuları yönet ve fizyoterapist ata</p>
        </div>

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
                    className="flex flex-col gap-4 p-4 border rounded-md hover-elevate"
                    data-testid={`appointment-${appointment.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
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
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {getTherapistName(appointment.therapistId)}
                          </div>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">Hizmet:</span> {appointment.service}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAppointment(appointment)}
                          data-testid={`button-view-${appointment.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Fizyoterapist</label>
                        <Select
                          value={appointment.therapistId || "none"}
                          onValueChange={(value) =>
                            updateAppointmentMutation.mutate({
                              id: appointment.id,
                              updates: { therapistId: value === "none" ? null : value },
                            })
                          }
                          disabled={therapistsLoading || updateAppointmentMutation.isPending}
                        >
                          <SelectTrigger data-testid={`select-therapist-${appointment.id}`}>
                            <SelectValue placeholder="Fizyoterapist Seç" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Atanmadı</SelectItem>
                            {therapists?.map((therapist) => (
                              <SelectItem key={therapist.id} value={therapist.id}>
                                {therapist.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Durum</label>
                        <Select
                          value={appointment.status}
                          onValueChange={(value) =>
                            updateAppointmentMutation.mutate({
                              id: appointment.id,
                              updates: { status: value },
                            })
                          }
                          disabled={updateAppointmentMutation.isPending}
                        >
                          <SelectTrigger data-testid={`select-status-${appointment.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Beklemede</SelectItem>
                            <SelectItem value="approved">Onaylandı</SelectItem>
                            <SelectItem value="cancelled">İptal Edildi</SelectItem>
                            <SelectItem value="completed">Tamamlandı</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
      </div>

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
              <div>
                <label className="text-sm font-medium">Fizyoterapist</label>
                <p className="text-sm text-muted-foreground">{getTherapistName(selectedAppointment.therapistId)}</p>
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
    </AdminLayout>
  );
}
