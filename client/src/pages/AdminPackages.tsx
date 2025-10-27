import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Package, InsertPackage } from "@shared/schema";
import { insertPackageSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Plus, Edit, Trash2, Package as PackageIcon } from "lucide-react";

export default function AdminPackages() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPackage) => {
      return apiRequest("POST", "/api/packages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      setCreateOpen(false);
      toast({ title: "Başarılı", description: "Paket oluşturuldu" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Paket oluşturulamadı", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPackage> }) => {
      return apiRequest("PATCH", `/api/packages/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      setEditOpen(false);
      setSelectedPackage(null);
      toast({ title: "Başarılı", description: "Paket güncellendi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Paket güncellenemedi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({ title: "Başarılı", description: "Paket silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Paket silinemedi", variant: "destructive" });
    },
  });

  const createForm = useForm<InsertPackage>({
    resolver: zodResolver(insertPackageSchema),
    defaultValues: {
      name: "",
      sessionCount: 1,
      price: 0,
      description: "",
      isActive: true,
    },
  });

  const editForm = useForm<InsertPackage>({
    resolver: zodResolver(insertPackageSchema),
    defaultValues: {
      name: "",
      sessionCount: 1,
      price: 0,
      description: "",
      isActive: true,
    },
  });

  const handleCreateSubmit = (data: InsertPackage) => {
    const cleanedData = {
      ...data,
      price: Math.round(data.price * 100), // Convert TL to kuruş
      description: data.description || undefined,
    };
    createMutation.mutate(cleanedData);
  };

  const handleEditSubmit = (data: InsertPackage) => {
    if (selectedPackage) {
      const cleanedData = {
        ...data,
        price: Math.round(data.price * 100), // Convert TL to kuruş
        description: data.description || undefined,
      };
      updateMutation.mutate({ id: selectedPackage.id, data: cleanedData });
    }
  };

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    editForm.reset({
      name: pkg.name,
      sessionCount: pkg.sessionCount,
      price: pkg.price / 100, // Convert kuruş to TL for form display
      description: pkg.description || "",
      isActive: pkg.isActive,
    });
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu paketi silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatPrice = (kurusPrice: number) => {
    return `${(kurusPrice / 100).toFixed(2)} ₺`;
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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Paket Yönetimi</h1>
          <p className="text-muted-foreground">Toplam {packages.length} paket</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} data-testid="button-add-package">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Paket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} data-testid={`card-package-${pkg.id}`} className={!pkg.isActive ? "opacity-60" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageIcon className="h-5 w-5" />
                  <span data-testid={`text-package-name-${pkg.id}`}>{pkg.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(pkg)}
                    data-testid={`button-edit-${pkg.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(pkg.id)}
                    data-testid={`button-delete-${pkg.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-2xl font-bold text-primary">{formatPrice(pkg.price)}</p>
                  <p className="text-sm text-muted-foreground">{pkg.sessionCount} Seans</p>
                </div>
                {pkg.description && (
                  <p className="text-sm">{pkg.description}</p>
                )}
                <p className="text-sm">
                  <span className="font-semibold">Durum:</span>{" "}
                  {pkg.isActive ? (
                    <span className="text-green-600">Aktif</span>
                  ) : (
                    <span className="text-gray-500">Pasif</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent data-testid="dialog-create-package">
          <DialogHeader>
            <DialogTitle>Yeni Paket Oluştur</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paket Adı *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Örn: Temel Paket" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="sessionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seans Sayısı *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          data-testid="input-session-count"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiyat (TL) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormDescription>TL olarak girin, kuruş olarak saklanır</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktif</FormLabel>
                      <FormDescription>
                        Paket aktif olduğunda müşterilere gösterilir
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-isactive"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel">
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-package">
                  {createMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-testid="dialog-edit-package">
          <DialogHeader>
            <DialogTitle>Paket Düzenle</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paket Adı *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-name-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="sessionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seans Sayısı *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          data-testid="input-session-count-edit"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiyat (TL) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-price-edit"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} data-testid="input-description-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktif</FormLabel>
                      <FormDescription>
                        Paket aktif olduğunda müşterilere gösterilir
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-isactive-edit"
                      />
                    </FormControl>
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
