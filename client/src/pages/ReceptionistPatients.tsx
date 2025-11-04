import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Search, Phone, Mail, User } from "lucide-react";
import { useState } from "react";
import type { Patient } from "@shared/schema";

export default function ReceptionistPatients() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/receptionist/patients"],
  });

  const filteredPatients = patients.filter(
    (patient) =>
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.tcNumber && patient.tcNumber.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/receptionist/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Hasta Listesi</h1>
            <p className="text-sm text-muted-foreground">
              Kayıtlı hastaları görüntüleyin ve yönetin
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Tüm Hastalar ({filteredPatients.length})</CardTitle>
              <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Hasta ara (ad, telefon, TC)..."
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
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Hasta bulunamadı" : "Henüz kayıtlı hasta bulunmuyor"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-start justify-between p-4 border rounded-md hover-elevate"
                    data-testid={`patient-${patient.id}`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {patient.fullName}
                        </h3>
                        {patient.isVerified && (
                          <Badge variant="default">Doğrulandı</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </div>
                        {patient.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {patient.email}
                          </div>
                        )}
                        {patient.tcNumber && (
                          <div className="text-sm">
                            <span className="font-medium">TC:</span> {patient.tcNumber}
                          </div>
                        )}
                      </div>
                      {patient.birthDate && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Doğum Tarihi:</span>{" "}
                          {new Date(patient.birthDate).toLocaleDateString("tr-TR")}
                        </p>
                      )}
                      {patient.gender && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Cinsiyet:</span>{" "}
                          {patient.gender === "male" ? "Erkek" : patient.gender === "female" ? "Kadın" : "Diğer"}
                        </p>
                      )}
                      {patient.address && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          <span className="font-medium">Adres:</span> {patient.address}
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
