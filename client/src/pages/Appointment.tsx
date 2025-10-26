import { Calendar, Clock, User, Phone, Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertAppointmentSchema, type InsertAppointment } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Appointment() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const services = [
    "Fizik Tedavi",
    "Manuel Terapi",
    "Ortopedik Rehabilitasyon",
    "Skolyoz Tedavisi",
    "Bel ve Boyun Fıtığı Tedavisi",
    "Nörolojik Rehabilitasyon",
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  const form = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: "",
      date: "",
      time: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      return await apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Randevu Talebiniz Alındı",
        description: "En kısa sürede size dönüş yapacağız.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Randevu oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertAppointment) => {
    mutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="max-w-2xl mx-auto text-center" data-testid="card-success">
            <CardContent className="pt-12 pb-12">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/10 p-6 rounded-full">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold mb-4 text-foreground">Randevu Talebiniz Alındı!</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Randevu talebiniz başarıyla iletildi. Uzman ekibimiz en kısa sürede sizinle iletişime geçerek
                randevunuzu onaylayacaktır.
              </p>
              <div className="bg-accent rounded-lg p-6 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Not:</strong> Acil durumlar için doğrudan{" "}
                  <a href="tel:+905326127244" className="text-primary hover:underline">
                    +90 532 612 72 44
                  </a>{" "}
                  numaralı telefonumuzdan bize ulaşabilirsiniz.
                </p>
              </div>
              <Button
                variant="default"
                size="lg"
                onClick={() => setIsSuccess(false)}
                data-testid="button-new-appointment"
              >
                Yeni Randevu Al
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold mb-4 text-foreground" data-testid="text-appointment-title">
              Randevu Al
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Uzman fizyoterapistlerimizden randevu almak için formu doldurun. Size en kısa sürede dönüş yapacağız.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card className="hover-elevate" data-testid="card-info-service">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Hizmet Seçimi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    İhtiyacınıza uygun fizik tedavi ve rehabilitasyon hizmetini seçin. Hangi hizmete ihtiyacınız
                    olduğundan emin değilseniz, mesaj bölümünde durumunuzu açıklayabilirsiniz.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-info-time">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Randevu Saatleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Pazartesi - Cuma:</strong> 09:00 - 19:00</p>
                    <p><strong>Cumartesi:</strong> 09:00 - 14:00</p>
                    <p><strong>Pazar:</strong> Kapalı</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate" data-testid="card-info-contact">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Direkt İletişim
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Acil durumlar veya hızlı randevu için doğrudan arayabilirsiniz:
                  </p>
                  <a
                    href="tel:+905326127244"
                    className="text-primary hover:underline font-semibold"
                    data-testid="link-appointment-phone"
                  >
                    +90 532 612 72 44
                  </a>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card data-testid="card-appointment-form">
                <CardHeader>
                  <CardTitle className="text-2xl">Randevu Formu</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <User className="h-4 w-4 inline mr-2" />
                                Ad Soyad *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Adınız ve soyadınız"
                                  {...field}
                                  data-testid="input-appointment-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Phone className="h-4 w-4 inline mr-2" />
                                Telefon *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="0532 123 45 67"
                                  {...field}
                                  data-testid="input-appointment-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <Mail className="h-4 w-4 inline mr-2" />
                              E-posta
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="ornek@email.com"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-appointment-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <MessageSquare className="h-4 w-4 inline mr-2" />
                              Hizmet Türü *
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-service">
                                  <SelectValue placeholder="Hizmet seçiniz" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {services.map((service) => (
                                  <SelectItem key={service} value={service}>
                                    {service}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Calendar className="h-4 w-4 inline mr-2" />
                                Tercih Edilen Tarih *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  min={new Date().toISOString().split('T')[0]}
                                  {...field}
                                  data-testid="input-appointment-date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <Clock className="h-4 w-4 inline mr-2" />
                                Tercih Edilen Saat *
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-time">
                                    <SelectValue placeholder="Saat seçiniz" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {timeSlots.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <MessageSquare className="h-4 w-4 inline mr-2" />
                              Ek Notlar (Opsiyonel)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Şikayetlerinizi veya özel notlarınızı buraya yazabilirsiniz..."
                                className="min-h-[100px]"
                                {...field}
                                value={field.value || ""}
                                data-testid="input-appointment-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-accent rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">
                          <strong>Önemli:</strong> Randevu talebiniz tarafımıza iletilecek ve uzman ekibimiz
                          tarafından onaylandıktan sonra size bilgi verilecektir. Kesin randevunuz telefon
                          görüşmesi sonrası teyit edilecektir.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={mutation.isPending}
                        data-testid="button-submit-appointment"
                      >
                        {mutation.isPending ? "Gönderiliyor..." : "Randevu Talebi Oluştur"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
