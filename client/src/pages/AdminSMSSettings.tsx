import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Smartphone, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { SEO } from "@/components/SEO";

const smsSettingsSchema = z.object({
  provider: z.enum(["twilio", "other"], {
    required_error: "Sağlayıcı seçiniz",
  }),
  accountSid: z.string().min(1, "Account SID gereklidir"),
  authToken: z.string().min(1, "Auth Token gereklidir"),
  phoneNumber: z.string().min(1, "Telefon numarası gereklidir"),
  isActive: z.boolean().default(true),
});

type SMSSettingsFormData = z.infer<typeof smsSettingsSchema>;

type SMSSetting = {
  id: number;
  provider: string;
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  isActive: boolean;
};

export default function AdminSMSSettings() {
  const { toast } = useToast();
  const [existingSettingId, setExistingSettingId] = useState<number | null>(null);

  const { data: settings, isLoading } = useQuery<SMSSetting[]>({
    queryKey: ["/api/admin/sms-settings"],
  });

  const form = useForm<SMSSettingsFormData>({
    resolver: zodResolver(smsSettingsSchema),
    defaultValues: {
      provider: "twilio",
      accountSid: "",
      authToken: "",
      phoneNumber: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      const setting = settings[0];
      setExistingSettingId(setting.id);
      form.reset({
        provider: setting.provider as "twilio" | "other",
        accountSid: setting.accountSid,
        authToken: setting.authToken,
        phoneNumber: setting.phoneNumber,
        isActive: setting.isActive,
      });
    }
  }, [settings, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: SMSSettingsFormData) => {
      if (existingSettingId) {
        return await apiRequest("PATCH", `/api/admin/sms-settings/${existingSettingId}`, data);
      } else {
        return await apiRequest("POST", "/api/admin/sms-settings", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sms-settings"] });
      toast({
        title: "Başarılı",
        description: "SMS ayarları kaydedildi",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Ayarlar kaydedilemedi",
      });
    },
  });

  const onSubmit = (data: SMSSettingsFormData) => {
    saveMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <SEO
        title="SMS Ayarları - İnsan Fizik Tedavi ve Rehabilitasyon Merkezi"
        description="SMS sağlayıcı ayarlarını yönetin"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SMS Ayarları</h1>
          <p className="text-muted-foreground">
            Hasta girişi için SMS doğrulama ayarlarını yapılandırın
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle>SMS Sağlayıcı Yapılandırması</CardTitle>
            </div>
            <CardDescription>
              Twilio veya başka bir SMS sağlayıcısının API bilgilerini girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMS Sağlayıcı</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-provider">
                              <SelectValue placeholder="Sağlayıcı seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="twilio">Twilio</SelectItem>
                            <SelectItem value="other">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          SMS göndermek için kullanılacak servis
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountSid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account SID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            data-testid="input-account-sid"
                          />
                        </FormControl>
                        <FormDescription>
                          Twilio hesap kimlik numarası
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Auth Token</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••••••••••••••••••••••••••"
                            data-testid="input-auth-token"
                          />
                        </FormControl>
                        <FormDescription>
                          Twilio kimlik doğrulama token'ı
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gönderici Telefon Numarası</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+1234567890"
                            data-testid="input-phone-number"
                          />
                        </FormControl>
                        <FormDescription>
                          SMS'lerin gönderileceği Twilio telefon numarası
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-is-active"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>SMS Gönderimi Aktif</FormLabel>
                          <FormDescription>
                            Bu seçenek kapalıysa, SMS'ler sadece console'a yazılır (test modu)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending}
                      data-testid="button-save-settings"
                    >
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : (
                        "Ayarları Kaydet"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
