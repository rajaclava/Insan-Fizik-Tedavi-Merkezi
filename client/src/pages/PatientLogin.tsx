import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Phone, Lock } from "lucide-react";

const phoneSchema = z.object({
  phone: z.string()
    .min(10, "Geçerli bir telefon numarası girin")
    .max(15, "Telefon numarası çok uzun")
    .regex(/^[0-9+\s-]+$/, "Sadece rakam, +, boşluk ve - kullanabilirsiniz"),
});

const otpSchema = z.object({
  code: z.string()
    .length(6, "Doğrulama kodu 6 haneli olmalıdır")
    .regex(/^[0-9]+$/, "Sadece rakam giriniz"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function PatientLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: async (data: PhoneFormData) => {
      const res = await apiRequest("POST", "/api/auth/send-otp", data) as any;
      return res;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Kod Gönderildi",
        description: data?.message || "Doğrulama kodu telefonunuza gönderildi",
      });
      setStep("otp");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Kod gönderilemedi",
      });
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: async (data: OTPFormData) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", {
        phone: phoneNumber,
        code: data.code,
      });
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Giriş Başarılı",
        description: "Hasta paneline yönlendiriliyorsunuz",
      });
      setLocation("/patient/dashboard");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Doğrulama Hatası",
        description: error.message || "Geçersiz kod",
      });
    },
  });

  const onPhoneSubmit = (data: PhoneFormData) => {
    setPhoneNumber(data.phone);
    sendOTPMutation.mutate(data);
  };

  const onOTPSubmit = (data: OTPFormData) => {
    verifyOTPMutation.mutate(data);
  };

  const handleResendCode = () => {
    if (phoneNumber) {
      sendOTPMutation.mutate({ phone: phoneNumber });
    }
  };

  const handleChangePhone = () => {
    setStep("phone");
    otpForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Hasta Girişi</CardTitle>
          <CardDescription className="text-center">
            {step === "phone" 
              ? "Telefon numaranızı girerek devam edin"
              : "Size gönderilen doğrulama kodunu girin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon Numarası</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="tel"
                            placeholder="0532 612 72 44"
                            className="pl-10"
                            data-testid="input-phone"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={sendOTPMutation.isPending}
                  data-testid="button-send-otp"
                >
                  {sendOTPMutation.isPending ? "Gönderiliyor..." : "Kod Gönder"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
                <div className="text-sm text-muted-foreground text-center mb-4">
                  <Phone className="inline h-4 w-4 mr-1" />
                  {phoneNumber}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleChangePhone}
                    className="ml-2 underline"
                    data-testid="button-change-phone"
                  >
                    Değiştir
                  </Button>
                </div>

                <FormField
                  control={otpForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doğrulama Kodu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="text"
                            placeholder="123456"
                            maxLength={6}
                            className="pl-10 text-center text-2xl tracking-widest"
                            data-testid="input-otp-code"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyOTPMutation.isPending}
                  data-testid="button-verify-otp"
                >
                  {verifyOTPMutation.isPending ? "Doğrulanıyor..." : "Doğrula"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendCode}
                    disabled={sendOTPMutation.isPending}
                    className="underline"
                    data-testid="button-resend-code"
                  >
                    {sendOTPMutation.isPending ? "Gönderiliyor..." : "Kodu Tekrar Gönder"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
