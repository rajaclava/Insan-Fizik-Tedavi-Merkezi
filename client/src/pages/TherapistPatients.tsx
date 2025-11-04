import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, User, Phone, Mail } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  createdAt: string;
}

function TherapistPatientsContent() {
  const [, setLocation] = useLocation();

  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/therapist/patients"],
  });

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
            onClick={() => setLocation("/therapist/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Hastalarım</h1>
            <p className="text-muted-foreground">
              Size atanmış hastaların listesi
            </p>
          </div>
        </div>

        {patients && patients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => (
              <Card key={patient.id} data-testid={`patient-${patient.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {patient.fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${patient.phone}`} className="hover:underline">
                      {patient.phone}
                    </a>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${patient.email}`} className="hover:underline">
                        {patient.email}
                      </a>
                    </div>
                  )}
                  {patient.birthDate && (
                    <p className="text-sm text-muted-foreground">
                      Doğum Tarihi: {new Date(patient.birthDate).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                  {patient.gender && (
                    <p className="text-sm text-muted-foreground">
                      Cinsiyet: {patient.gender === "male" ? "Erkek" : patient.gender === "female" ? "Kadın" : "Diğer"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Henüz size atanmış hasta bulunmuyor
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Hastalar tedavi planları oluşturulduğunda burada görünecektir
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TherapistPatients() {
  return (
    <ProtectedRoute allowedRoles={["therapist"]}>
      <TherapistPatientsContent />
    </ProtectedRoute>
  );
}
