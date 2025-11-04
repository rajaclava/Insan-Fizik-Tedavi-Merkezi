import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

interface Appointment {
  id: string;
  service: string;
  date: string;
  startTime: string;
  status: string;
  message?: string;
  createdAt: string;
}

export default function PatientAppointments() {
  const [, setLocation] = useLocation();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/patient/appointments"],
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="text-center">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/patient/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Randevularım</h1>
            <p className="text-muted-foreground">
              Tüm randevularınızı buradan görüntüleyebilirsiniz
            </p>
          </div>
        </div>

        {appointments && appointments.length > 0 ? (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id} data-testid={`appointment-${appointment.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{appointment.service}</CardTitle>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.date).toLocaleDateString("tr-TR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.startTime}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                {appointment.message && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      <strong>Not:</strong> {appointment.message}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Henüz randevunuz bulunmuyor</p>
              <Button
                className="mt-4"
                onClick={() => setLocation("/randevu")}
                data-testid="button-new-appointment"
              >
                Yeni Randevu Al
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
