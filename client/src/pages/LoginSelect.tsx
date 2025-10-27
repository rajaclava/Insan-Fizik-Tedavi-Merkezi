import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Users, Stethoscope, Shield } from "lucide-react";

export default function LoginSelect() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
          <p className="text-muted-foreground">
            Lütfen giriş tipinizi seçin
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/patient/login")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>Hasta Girişi</CardTitle>
              <CardDescription>
                Telefon numaranızla giriş yapın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-patient-login">
                Hasta Girişi
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Telefon numaranıza gönderilen doğrulama kodu ile giriş yapabilirsiniz
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/therapist/login")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>Fizyoterapist Girişi</CardTitle>
              <CardDescription>
                Kullanıcı adı ve şifrenizle giriş yapın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-therapist-login">
                Fizyoterapist Girişi
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Size verilen kullanıcı adı ve şifre ile giriş yapabilirsiniz
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/admin/login")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>Admin Girişi</CardTitle>
              <CardDescription>
                Yönetici paneline erişim
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-admin-login">
                Admin Girişi
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Sistem yöneticisi yetkisi ile giriş yapabilirsiniz
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
