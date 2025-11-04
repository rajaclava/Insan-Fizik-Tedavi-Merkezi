import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, UserPlus } from "lucide-react";

const patientSchema = z.object({
  fullName: z.string().min(1, "Ad soyad gereklidir"),
  tcNumber: z.string().optional(),
  phone: z.string().min(1, "Telefon numarası gereklidir"),
  email: z.string().email("Geçerli bir e-posta adresi girin").optional().or(z.literal("")),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  registrationNotes: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;

export default function ReceptionistPatientIntake() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: "",
      tcNumber: "",
      phone: "",
      email: "",
      birthDate: "",
      gender: "",
      address: "",
      notes: "",
      source: "kurumZiyaret",
      registrationNotes: "",
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: (data: PatientForm) => apiRequest("POST", "/api/receptionist/patients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receptionist/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/receptionist/registrations"] });
      toast({
        title: "Başarılı",
        description: "Hasta kaydı başarıyla oluşturuldu",
      });
      form.reset();
      setLocation("/receptionist/patients");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Hasta kaydı oluşturulamadı",
      });
    },
  });

  const onSubmit = async (data: PatientForm) => {
    setIsSubmitting(true);
    try {
      await createPatientMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
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
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-primary" />
              Yeni Hasta Kaydı
            </h1>
            <p className="text-sm text-muted-foreground">
              Hasta bilgilerini girin ve kaydı oluşturun
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Hasta Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Soyad *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Örn: Ahmet Yılmaz" data-testid="input-fullName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tcNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TC Kimlik No</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="11111111111" maxLength={11} data-testid="input-tcNumber" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0532 XXX XX XX" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="ornek@email.com" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doğum Tarihi</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-birthDate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cinsiyet</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Erkek</SelectItem>
                            <SelectItem value="female">Kadın</SelectItem>
                            <SelectItem value="other">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Adres bilgisi..." data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kayıt Kaynağı</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-source">
                            <SelectValue placeholder="Seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kurumZiyaret">Kurum Ziyaret</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="googleAds">Google Ads</SelectItem>
                          <SelectItem value="webSitesi">Web Sitesi</SelectItem>
                          <SelectItem value="tavsiye">Tavsiye</SelectItem>
                          <SelectItem value="doktorYonlendirmesi">Doktor Yönlendirmesi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notlar</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Hasta hakkında notlar..." data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kayıt Notları</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Bu kayıt hakkında notlar..." data-testid="input-registrationNotes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/receptionist/dashboard")}
                    disabled={isSubmitting}
                    data-testid="button-cancel"
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={isSubmitting} data-testid="button-submit">
                    {isSubmitting ? "Kaydediliyor..." : "Hasta Kaydı Oluştur"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
