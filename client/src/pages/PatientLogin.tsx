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
import { Mail, Lock } from "lucide-react";

const emailSchema = z.object({
  email: z.string()
    .email("Geçerli bir email adresi girin")
    .min(1, "Email adresi gereklidir"),
});

const otpSchema = z.object({
  code: z.string()
    .length(6, "Doğrulama kodu 6 haneli olmalıdır")
    .regex(/^[0-9]+$/, "Sadece rakam giriniz"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function PatientLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // Will be received from backend

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: async (data: EmailFormData) => {
      const res = await apiRequest("POST", "/api/auth/send-otp-by-email", data);
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.phone) {
        setPhoneNumber(data.phone); // Save phone number for verification
      }
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
      return await res.json();
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

  const onEmailSubmit = (data: EmailFormData) => {
    setEmailAddress(data.email);
    sendOTPMutation.mutate(data);
  };

  const onOTPSubmit = (data: OTPFormData) => {
    verifyOTPMutation.mutate(data);
  };

  const handleResendCode = () => {
    if (emailAddress) {
      sendOTPMutation.mutate({ email: emailAddress });
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    otpForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Hasta Girişi</CardTitle>
          <CardDescription className="text-center">
            {step === "email" 
              ? "Email adresinizi girerek devam edin"
              : "Telefonunuza gönderilen doğrulama kodunu girin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Adresi</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="ornek@email.com"
                            className="pl-10"
                            data-testid="input-email"
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
                  <Mail className="inline h-4 w-4 mr-1" />
                  {emailAddress}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleChangeEmail}
                    className="ml-2 underline"
                    data-testid="button-change-email"
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
