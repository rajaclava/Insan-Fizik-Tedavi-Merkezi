import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, FileText, DollarSign, LogOut, UserPlus, ClipboardList } from "lucide-react";

export default function ReceptionistDashboard() {
  const [, setLocation] = useLocation();

  const { data: registrations = [] } = useQuery<any[]>({
    queryKey: ["/api/receptionist/registrations"],
  });

  const { data: transactions = [] } = useQuery<any[]>({
    queryKey: ["/api/receptionist/transactions"],
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/receptionist/login");
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Sekreter Paneli</h1>
            <p className="text-sm text-muted-foreground">İnsan Fizik Tedavi Merkezi</p>
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
          <h2 className="text-xl font-semibold mb-2">Hoş Geldiniz</h2>
          <p className="text-muted-foreground">
            Hasta kayıtları ve işlemleri buradan yönetebilirsiniz
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kayıt</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-registrations-count">
                {registrations.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Yaptığınız toplam hasta kaydı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam İşlem</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-transactions-count">
                {transactions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Kayıtlı ödeme işlemi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">
                ₺{(totalRevenue / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Kaydettiğiniz toplam gelir
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/receptionist/patient-intake")}>
            <CardHeader>
              <UserPlus className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Yeni Hasta Kaydı</CardTitle>
              <CardDescription>
                Yeni hasta kaydı oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-patient-intake">
                Kayıt Yap
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/receptionist/patients")}>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Hasta Listesi</CardTitle>
              <CardDescription>
                Tüm hastaları görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-patients">
                Görüntüle
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/receptionist/transactions")}>
            <CardHeader>
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Ödeme İşlemleri</CardTitle>
              <CardDescription>
                Ödeme kayıtlarını görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-transactions">
                Görüntüle
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
