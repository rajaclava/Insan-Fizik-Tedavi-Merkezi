import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Therapist, InsertTherapist } from "@shared/schema";
import { insertTherapistSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, UserCog } from "lucide-react";

export default function AdminTherapists() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  const { data: therapists = [], isLoading } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTherapist) => {
      return apiRequest("POST", "/api/therapists", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapists"] });
      setCreateOpen(false);
      toast({ title: "Başarılı", description: "Fizyoterapist kaydı oluşturuldu" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Fizyoterapist kaydı oluşturulamadı", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTherapist> }) => {
      return apiRequest("PATCH", `/api/therapists/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapists"] });
      setEditOpen(false);
      setSelectedTherapist(null);
      toast({ title: "Başarılı", description: "Fizyoterapist güncellendi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Fizyoterapist güncellenemedi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/therapists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapists"] });
      toast({ title: "Başarılı", description: "Fizyoterapist kaydı silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Fizyoterapist silinemedi", variant: "destructive" });
    },
  });

  const createForm = useForm<InsertTherapist>({
    resolver: zodResolver(insertTherapistSchema),
    defaultValues: {
      userId: "",
      title: "",
      expertise: [],
      bio: "",
      workHours: undefined,
    },
  });

  const editForm = useForm<InsertTherapist>({
    resolver: zodResolver(insertTherapistSchema),
    defaultValues: {
      userId: "",
      title: "",
      expertise: [],
      bio: "",
      workHours: undefined,
    },
  });

  const handleCreateSubmit = (data: InsertTherapist) => {
    const cleanedData = {
      ...data,
      expertise: data.expertise && data.expertise.length > 0 ? data.expertise : [],
      bio: data.bio || undefined,
      workHours: data.workHours || undefined,
    };
    createMutation.mutate(cleanedData);
  };

  const handleEditSubmit = (data: InsertTherapist) => {
    if (selectedTherapist) {
      const cleanedData = {
        ...data,
        expertise: data.expertise && data.expertise.length > 0 ? data.expertise : [],
        bio: data.bio || undefined,
        workHours: data.workHours || undefined,
      };
      updateMutation.mutate({ id: selectedTherapist.id, data: cleanedData });
    }
  };

  const handleEdit = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    editForm.reset({
      userId: therapist.userId,
      title: therapist.title,
      expertise: therapist.expertise || [],
      bio: therapist.bio || "",
      workHours: therapist.workHours || undefined,
    });
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu fizyoterapisti silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Fizyoterapist Yönetimi</h1>
          <p className="text-muted-foreground">Toplam {therapists.length} fizyoterapist</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} data-testid="button-add-therapist">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Fizyoterapist
        </Button>
      </div>

      <div className="grid gap-4">
        {therapists.map((therapist) => (
          <Card key={therapist.id} data-testid={`card-therapist-${therapist.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  <span data-testid={`text-therapist-title-${therapist.id}`}>{therapist.title}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(therapist)}
                    data-testid={`button-edit-${therapist.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(therapist.id)}
                    data-testid={`button-delete-${therapist.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Kullanıcı ID:</span> {therapist.userId}
                </p>
                {therapist.expertise && therapist.expertise.length > 0 && (
                  <p className="text-sm">
                    <span className="font-semibold">Uzmanlık:</span>{" "}
                    {therapist.expertise.join(", ")}
                  </p>
                )}
                {therapist.bio && (
                  <p className="text-sm">
                    <span className="font-semibold">Biyografi:</span> {therapist.bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent data-testid="dialog-create-therapist">
          <DialogHeader>
            <DialogTitle>Yeni Fizyoterapist Kaydı</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı ID *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-userid" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ünvan *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dr., Fzt., vb." data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biyografi</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-bio" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel">
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-therapist">
                  {createMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-testid="dialog-edit-therapist">
          <DialogHeader>
            <DialogTitle>Fizyoterapist Düzenle</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı ID *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-userid-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ünvan *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-title-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biyografi</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-bio-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} data-testid="button-cancel-edit">
                  İptal
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                  {updateMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
