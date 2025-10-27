import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, FileText, Activity, LogOut, User } from "lucide-react";

export default function TherapistDashboard() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/therapist/login");
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Terapist Paneli</h1>
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Hoş Geldiniz</h2>
          <p className="text-muted-foreground">
            Hastalarınızı ve tedavi süreçlerini buradan yönetebilirsiniz
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/therapist/patients")}>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Hastalarım</CardTitle>
              <CardDescription>
                Tüm hastalarınızı görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-patients">
                Görüntüle
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/therapist/treatment-plans")}>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Tedavi Planları</CardTitle>
              <CardDescription>
                Hasta tedavi planlarını oluşturun ve güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-treatment-plans">
                Yönet
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/therapist/session-notes")}>
            <CardHeader>
              <Activity className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Seans Notları</CardTitle>
              <CardDescription>
                Seans notlarınızı kaydedin ve inceleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-session-notes">
                Yönet
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Günlük İpuçları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Her seans sonrası detaylı notlar almayı unutmayın
              </p>
              <p className="text-sm text-muted-foreground">
                • Tedavi planlarını hastanın ilerlemesine göre düzenli güncelleyin
              </p>
              <p className="text-sm text-muted-foreground">
                • Ev egzersiz programlarını net ve anlaşılır şekilde hazırlayın
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
