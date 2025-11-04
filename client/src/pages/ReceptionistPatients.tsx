import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ArrowLeft, Search, Phone, TrendingUp, Clock, XCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import type { Patient, PatientRegistration } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Extended type for joined data
type RegistrationWithPatient = PatientRegistration & {
  patient?: Patient;
};

export default function ReceptionistPatients() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<PatientRegistration | null>(null);
  const [saleAmount, setSaleAmount] = useState("");
  const [conversionNotes, setConversionNotes] = useState("");
  const { toast } = useToast();

  // Fetch registrations
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<PatientRegistration[]>({
    queryKey: ["/api/receptionist/registrations"],
  });

  // Fetch patients
  const { data: patients = [], isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/receptionist/patients"],
  });

  // Join registrations with patients
  const registrationsWithPatients: RegistrationWithPatient[] = registrations.map((reg) => ({
    ...reg,
    patient: patients.find((p) => p.id === reg.patientId),
  }));

  // Filter
  const filtered = registrationsWithPatients.filter((reg) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      reg.patient?.fullName.toLowerCase().includes(term) ||
      reg.patient?.phone.includes(term) ||
      reg.source?.toLowerCase().includes(term)
    );
  });

  const isLoading = registrationsLoading || patientsLoading;

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      return await apiRequest("PATCH", `/api/receptionist/registrations/${id}/status`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receptionist/registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reception/funnel"] });
      toast({ title: "Durum güncellendi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Durum güncellenemedi", variant: "destructive" });
    },
  });

  // Conversion mutation
  const convertMutation = useMutation({
    mutationFn: async ({ id, saleAmount, notes }: { id: string; saleAmount: number; notes?: string }) => {
      return await apiRequest("POST", `/api/receptionist/registrations/${id}/convert`, { saleAmount, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receptionist/registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reception/funnel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reception/stats"] });
      setConvertDialogOpen(false);
      setSelectedRegistration(null);
      setSaleAmount("");
      setConversionNotes("");
      toast({ title: "Başarılı!", description: "Kayıt satışa dönüştürüldü" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Dönüştürme başarısız", variant: "destructive" });
    },
  });

  const handleConvert = () => {
    if (!selectedRegistration || !saleAmount) return;
    const amountInKurus = Math.round(parseFloat(saleAmount) * 100);
    convertMutation.mutate({
      id: selectedRegistration.id,
      saleAmount: amountInKurus,
      notes: conversionNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return <Badge variant="outline" data-testid="badge-registered">Kayıtlı</Badge>;
      case "waiting":
        return <Badge variant="secondary" data-testid="badge-waiting"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>;
      case "converted":
        return <Badge variant="default" data-testid="badge-converted"><CheckCircle2 className="w-3 h-3 mr-1" />Satış</Badge>;
      case "cancelled":
        return <Badge variant="destructive" data-testid="badge-cancelled"><XCircle className="w-3 h-3 mr-1" />İptal</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceLabel = (source: string | null) => {
    const labels: Record<string, string> = {
      kurumZiyaret: "Kurum Ziyaret",
      instagram: "Instagram",
      googleAds: "Google Ads",
      webSitesi: "Web Sitesi",
      tavsiye: "Tavsiye",
      doktorYonlendirmesi: "Doktor Yönlendirmesi",
    };
    return labels[source || ""] || source || "Bilinmiyor";
  };

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
            <h1 className="text-2xl font-bold">Hasta Kayıtları (CRM)</h1>
            <p className="text-sm text-muted-foreground">
              Kayıt takibi, durum yönetimi ve satış dönüşümleri
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>Tüm Kayıtlar ({filtered.length})</CardTitle>
              <div className="flex items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ara (ad, telefon, kaynak)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Kayıt bulunamadı" : "Henüz kayıt bulunmuyor"}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-4 border rounded-md space-y-3"
                    data-testid={`registration-${reg.id}`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-lg">
                            {reg.patient?.fullName || "Bilinmeyen Hasta"}
                          </h3>
                          {getStatusBadge(reg.status || "registered")}
                          <Badge variant="outline">{getSourceLabel(reg.source)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {reg.patient?.phone || "Yok"}
                          </div>
                          <div>
                            Kayıt: {new Date(reg.createdAt!).toLocaleDateString("tr-TR")}
                          </div>
                          {reg.convertedAt && (
                            <div className="text-green-600 font-medium">
                              Satış: ₺{((reg.saleAmount || 0) / 100).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {reg.status !== "converted" && reg.status !== "cancelled" && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setConvertDialogOpen(true);
                            }}
                            data-testid={`button-convert-${reg.id}`}
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Satış
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => statusMutation.mutate({ id: reg.id, status: "waiting" })}
                            disabled={statusMutation.isPending}
                            data-testid={`button-waiting-${reg.id}`}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Beklet
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => statusMutation.mutate({ id: reg.id, status: "cancelled", reason: "Manuel iptal" })}
                            disabled={statusMutation.isPending}
                            data-testid={`button-cancel-${reg.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            İptal
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Conversion Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent data-testid="dialog-convert">
          <DialogHeader>
            <DialogTitle>Satışa Dönüştür</DialogTitle>
            <DialogDescription>
              {selectedRegistration?.patient?.fullName} için satış tutarını girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Satış Tutarı (₺)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Örn: 1500.00"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                data-testid="input-sale-amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
              <Textarea
                id="notes"
                placeholder="Satış hakkında notlar..."
                value={conversionNotes}
                onChange={(e) => setConversionNotes(e.target.value)}
                data-testid="input-conversion-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConvertDialogOpen(false)}
              data-testid="button-dialog-cancel"
            >
              İptal
            </Button>
            <Button
              onClick={handleConvert}
              disabled={!saleAmount || convertMutation.isPending}
              data-testid="button-dialog-confirm"
            >
              {convertMutation.isPending ? "Kaydediliyor..." : "Onayla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
