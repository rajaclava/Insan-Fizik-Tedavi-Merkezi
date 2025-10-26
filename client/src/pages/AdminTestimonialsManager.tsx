import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Star,
  User,
} from "lucide-react";
import type { Testimonial, InsertTestimonial } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const testimonialFormSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  review: z.string().min(10, "Yorum en az 10 karakter olmalıdır"),
  rating: z.coerce.number().min(1).max(5).default(5),
  approved: z.boolean().default(false),
});

type TestimonialFormData = z.infer<typeof testimonialFormSchema>;

export default function AdminTestimonialsManager() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation("/admin/login");
    },
  });

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      name: "",
      review: "",
      rating: 5,
      approved: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertTestimonial) => apiRequest("POST", "/api/testimonials", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials/approved"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Başarılı",
        description: "Yorum eklendi",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTestimonial> }) =>
      apiRequest("PATCH", `/api/testimonials/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials/approved"] });
      setIsDialogOpen(false);
      setEditingTestimonial(null);
      form.reset();
      toast({
        title: "Başarılı",
        description: "Yorum güncellendi",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/testimonials/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials/approved"] });
      toast({
        title: "Başarılı",
        description: "Yorum silindi",
      });
    },
  });

  useEffect(() => {
    if (editingTestimonial) {
      form.reset({
        name: editingTestimonial.name,
        review: editingTestimonial.review,
        rating: editingTestimonial.rating,
        approved: editingTestimonial.approved,
      });
    }
  }, [editingTestimonial, form]);

  const handleOpenDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
    } else {
      form.reset({
        name: "",
        review: "",
        rating: 5,
        approved: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTestimonial(null);
    form.reset();
  };

  const onSubmit = (data: TestimonialFormData) => {
    if (editingTestimonial) {
      updateMutation.mutate({ id: editingTestimonial.id, data: data as InsertTestimonial });
    } else {
      createMutation.mutate(data as InsertTestimonial);
    }
  };

  const toggleApproval = (testimonial: Testimonial) => {
    updateMutation.mutate({
      id: testimonial.id,
      data: { approved: !testimonial.approved },
    });
  };

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <SEO title="Yorumlar Yönetimi - Admin" description="Hasta yorumlarını yönet" path="/admin/testimonials" />

      <header className="bg-card border-b">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Yorumlar Yönetimi</h1>
              <p className="text-sm text-muted-foreground">Hoş geldiniz, {(user as any).username}</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin">
                <Button variant="outline" data-testid="link-dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Panel
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tüm Yorumlar</h2>
          <Button onClick={() => handleOpenDialog()} data-testid="button-new-testimonial">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Yorum
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : !testimonials || testimonials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Henüz yorum yok</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} data-testid={`card-testimonial-${testimonial.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant={testimonial.approved ? "default" : "secondary"}>
                            {testimonial.approved ? "Onaylandı" : "Onay Bekliyor"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleApproval(testimonial)}
                        data-testid={`button-toggle-${testimonial.id}`}
                      >
                        {testimonial.approved ? (
                          <XCircle className="w-4 h-4 text-destructive" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenDialog(testimonial)}
                        data-testid={`button-edit-${testimonial.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(testimonial.id)}
                        data-testid={`button-delete-${testimonial.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{testimonial.review}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(testimonial.createdAt || "").toLocaleDateString("tr-TR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent data-testid="dialog-testimonial-form">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Yorumu Düzenle" : "Yeni Yorum Ekle"}
            </DialogTitle>
            <DialogDescription>
              Hasta yorumunu buradan {editingTestimonial ? "düzenleyin" : "ekleyin"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasta Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmet Y." {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yorum</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tedavi süreci hakkında yorumunuz..."
                        className="min-h-24"
                        {...field}
                        data-testid="input-review"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Puan (1-5)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 5)}
                        data-testid="input-rating"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="approved"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        data-testid="input-approved"
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Onaylı</FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                  {editingTestimonial ? "Güncelle" : "Ekle"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
