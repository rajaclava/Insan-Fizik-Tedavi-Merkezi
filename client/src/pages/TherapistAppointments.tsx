import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Calendar, Clock, Phone, Mail, User, LogOut, Search, ArrowLeft } from "lucide-react";
import type { Appointment } from "@shared/schema";
import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function TherapistAppointments() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/therapist/appointments"],
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/therapist/login");
  };

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm) ||
      (apt.email && apt.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Beklemede", variant: "secondary" },
      PENDING: { label: "Beklemede", variant: "secondary" },
      confirmed: { label: "Onaylandı", variant: "default" },
      CONFIRMED: { label: "Onaylandı", variant: "default" },
      completed: { label: "Tamamlandı", variant: "outline" },
      COMPLETED: { label: "Tamamlandı", variant: "outline" },
      cancelled: { label: "İptal", variant: "destructive" },
      CANCELLED: { label: "İptal", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/therapist/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Randevularım</h1>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Atanmış Randevular ({filteredAppointments.length})</CardTitle>
              <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Hasta ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Yükleniyor...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Randevu bulunamadı" : "Size atanmış randevu bulunmamaktadır"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start justify-between p-4 border rounded-md hover-elevate"
                    data-testid={`appointment-${appointment.id}`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-lg">{appointment.name}</h3>
                        {getStatusBadge(appointment.status)}
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
                      {appointment.service && (
                        <div className="text-sm">
                          <span className="font-medium">Hizmet:</span> {appointment.service}
                        </div>
                      )}
                      {appointment.message && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {appointment.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
