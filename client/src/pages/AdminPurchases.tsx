import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Purchase, InsertPurchase, Package, Patient } from "@shared/schema";
import { insertPurchaseSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ShoppingCart } from "lucide-react";

export default function AdminPurchases() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const { data: purchases = [], isLoading } = useQuery<Purchase[]>({
    queryKey: ["/api/purchases"],
  });

  const { data: packages = [] } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPurchase) => {
      return apiRequest("POST", "/api/purchases", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      setCreateOpen(false);
      toast({ title: "Başarılı", description: "Satın alma kaydedildi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Satın alma kaydedilemedi", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPurchase> }) => {
      return apiRequest("PATCH", `/api/purchases/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      setEditOpen(false);
      setSelectedPurchase(null);
      toast({ title: "Başarılı", description: "Satın alma güncellendi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Satın alma güncellenemedi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/purchases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      toast({ title: "Başarılı", description: "Satın alma silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Satın alma silinemedi", variant: "destructive" });
    },
  });

  const createForm = useForm<InsertPurchase>({
    resolver: zodResolver(insertPurchaseSchema),
    defaultValues: {
      patientId: "",
      packageId: "",
      amount: 0,
      status: "PENDING",
      paymentRef: "",
    },
  });

  const editForm = useForm<InsertPurchase>({
    resolver: zodResolver(insertPurchaseSchema),
    defaultValues: {
      patientId: "",
      packageId: "",
      amount: 0,
      status: "PENDING",
      paymentRef: "",
    },
  });

  const handleCreateSubmit = (data: InsertPurchase) => {
    const cleanedData = {
      ...data,
      amount: Math.round(data.amount * 100), // Convert TL to kuruş
      paymentRef: data.paymentRef || undefined,
    };
    createMutation.mutate(cleanedData);
  };

  const handleEditSubmit = (data: InsertPurchase) => {
    if (selectedPurchase) {
      const cleanedData = {
        ...data,
        amount: Math.round(data.amount * 100), // Convert TL to kuruş
        paymentRef: data.paymentRef || undefined,
      };
      updateMutation.mutate({ id: selectedPurchase.id, data: cleanedData });
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    editForm.reset({
      patientId: purchase.patientId,
      packageId: purchase.packageId,
      amount: purchase.amount / 100, // Convert kuruş to TL for form display
      status: purchase.status,
      paymentRef: purchase.paymentRef || "",
    });
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu satın alma kaydını silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatPrice = (kurusPrice: number) => {
    return `${(kurusPrice / 100).toFixed(2)} ₺`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Bekliyor", className: "bg-yellow-500" },
      PAID: { label: "Ödendi", className: "bg-green-500" },
      REFUND: { label: "İade", className: "bg-red-500" },
    };
    const variant = variants[status] || variants.PENDING;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.fullName : "Bilinmiyor";
  };

  const getPackageName = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    return pkg ? pkg.name : "Bilinmiyor";
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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Satın Alma Yönetimi</h1>
          <p className="text-muted-foreground">Toplam {purchases.length} satın alma</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} data-testid="button-add-purchase">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Satın Alma
        </Button>
      </div>

      <div className="grid gap-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id} data-testid={`card-purchase-${purchase.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span data-testid={`text-invoice-${purchase.id}`}>{purchase.invoiceNumber}</span>
                  {getStatusBadge(purchase.status)}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(purchase)}
                    data-testid={`button-edit-${purchase.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(purchase.id)}
                    data-testid={`button-delete-${purchase.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="font-semibold">Hasta:</span> {getPatientName(purchase.patientId)}
                </div>
                <div>
                  <span className="font-semibold">Paket:</span> {getPackageName(purchase.packageId)}
                </div>
                <div>
                  <span className="font-semibold">Tutar:</span> <span className="text-lg text-primary">{formatPrice(purchase.amount)}</span>
                </div>
                {purchase.paymentRef && (
                  <div>
                    <span className="font-semibold">Ödeme Ref:</span> {purchase.paymentRef}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString("tr-TR") : "-"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent data-testid="dialog-create-purchase">
          <DialogHeader>
            <DialogTitle>Yeni Satın Alma Kaydı</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasta *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-patient">
                          <SelectValue placeholder="Hasta seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="packageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paket *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedPkg = packages.find((p) => p.id === value);
                        if (selectedPkg) {
                          createForm.setValue("amount", selectedPkg.price / 100); // Convert kuruş to TL
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-package">
                          <SelectValue placeholder="Paket seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {packages.filter((p) => p.isActive).map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - {formatPrice(pkg.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tutar (TL) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        data-testid="input-amount"
                      />
                    </FormControl>
                    <FormDescription>TL olarak girin, kuruş olarak saklanır</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durum *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Bekliyor</SelectItem>
                        <SelectItem value="PAID">Ödendi</SelectItem>
                        <SelectItem value="REFUND">İade</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="paymentRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ödeme Referansı</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-payment-ref" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} data-testid="button-cancel">
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-purchase">
                  {createMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-testid="dialog-edit-purchase">
          <DialogHeader>
            <DialogTitle>Satın Alma Düzenle</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durum *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status-edit">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Bekliyor</SelectItem>
                        <SelectItem value="PAID">Ödendi</SelectItem>
                        <SelectItem value="REFUND">İade</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="paymentRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ödeme Referansı</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-payment-ref-edit" />
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
