import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar, FileText, Activity, LogOut, User } from "lucide-react";

export default function PatientDashboard() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/patient/login");
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
            <h1 className="text-xl font-semibold">Hasta Paneli</h1>
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
            Tedavi bilgilerinize ve randevularınıza buradan ulaşabilirsiniz
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/patient/appointments")}>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Randevularım</CardTitle>
              <CardDescription>
                Geçmiş ve gelecek randevularınızı görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-appointments">
                Görüntüle
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/patient/treatment-plans")}>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Tedavi Planlarım</CardTitle>
              <CardDescription>
                Size özel hazırlanan tedavi planlarını inceleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-treatment-plans">
                Görüntüle
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/patient/exercises")}>
            <CardHeader>
              <Activity className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Egzersizlerim</CardTitle>
              <CardDescription>
                Ev egzersiz programınıza ulaşın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-exercises">
                Görüntüle
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Bilgilendirme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Tedavi planlarınız fizyoterapistiniz tarafından düzenli olarak güncellenmektedir
              </p>
              <p className="text-sm text-muted-foreground">
                • Egzersizlerinizi düzenli olarak yapmanız tedavi sürecinizi hızlandıracaktır
              </p>
              <p className="text-sm text-muted-foreground">
                • Randevu değişikliği için lütfen +90 532 612 72 44 numarasından bizimle iletişime geçin
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
