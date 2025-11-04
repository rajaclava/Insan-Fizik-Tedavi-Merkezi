import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPatientSchema, type InsertPatient, type Patient } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Download, Edit, Trash2, Eye, Calendar, Phone, Mail } from "lucide-react";

export default function AdminPatients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  const { data: patients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPatient) => {
      return apiRequest("POST", "/api/patients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setCreateOpen(false);
      toast({ title: "Başarılı", description: "Hasta kaydı oluşturuldu" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Hasta kaydı oluşturulamadı", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPatient> }) => {
      return apiRequest("PATCH", `/api/patients/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setEditOpen(false);
      setSelectedPatient(null);
      toast({ title: "Başarılı", description: "Hasta bilgileri güncellendi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Hasta güncellenemedi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({ title: "Başarılı", description: "Hasta kaydı silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Hasta silinemedi", variant: "destructive" });
    },
  });

  const createForm = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      fullName: "",
      tcNumber: "",
      phone: "",
      email: "",
      birthDate: "",
      gender: "",
      address: "",
      notes: "",
    },
  });

  const editForm = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      fullName: "",
      tcNumber: "",
      phone: "",
      email: "",
      birthDate: "",
      gender: "",
      address: "",
      notes: "",
    },
  });

  const handleCreateSubmit = (data: InsertPatient) => {
    const cleanedData = {
      ...data,
      tcNumber: data.tcNumber || undefined,
      email: data.email || undefined,
      birthDate: data.birthDate || undefined,
      gender: data.gender || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
      userId: data.userId || undefined,
    };
    createMutation.mutate(cleanedData);
  };

  const handleEditSubmit = (data: InsertPatient) => {
    if (selectedPatient) {
      const cleanedData = {
        ...data,
        tcNumber: data.tcNumber || undefined,
        email: data.email || undefined,
        birthDate: data.birthDate || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
        userId: data.userId || undefined,
      };
      updateMutation.mutate({ id: selectedPatient.id, data: cleanedData });
    }
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    editForm.reset({
      fullName: patient.fullName,
      tcNumber: patient.tcNumber ?? "",
      phone: patient.phone,
      email: patient.email ?? "",
      birthDate: patient.birthDate ?? "",
      gender: patient.gender ?? "",
      address: patient.address ?? "",
      notes: patient.notes ?? "",
    });
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu hasta kaydını silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleExportCSV = () => {
    window.location.href = "/api/patients/export/csv";
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hasta Yönetimi</h1>
          <p className="text-muted-foreground mt-1">
            Toplam {patients.length} hasta kaydı
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV İndir
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-patient">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Hasta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni Hasta Kaydı</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form
                  onSubmit={createForm.handleSubmit(handleCreateSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={createForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad Soyad *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-fullname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="tcNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TC Kimlik Numarası</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={11} placeholder="12345678901" data-testid="input-tc-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon *</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doğum Tarihi</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-birthdate" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
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
                              <SelectItem value="Erkek">Erkek</SelectItem>
                              <SelectItem value="Kadın">Kadın</SelectItem>
                              <SelectItem value="Diğer">Diğer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adres</FormLabel>
                        <FormControl>
                          <Textarea {...field} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notlar</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Özel notlar, sağlık geçmişi..."
                            data-testid="input-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateOpen(false)}
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      data-testid="button-submit-patient"
                    >
                      {createMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Hasta ara (ad, telefon, e-posta)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              data-testid="input-search"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Yükleniyor...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Hasta bulunamadı" : "Henüz hasta kaydı yok"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-start justify-between p-4 border rounded-md hover-elevate"
                  data-testid={`patient-${patient.id}`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-lg">{patient.fullName}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      {patient.tcNumber && (
                        <div className="flex items-center gap-1 font-medium">
                          <span>TC:</span>
                          {patient.tcNumber}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {patient.phone}
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {patient.email}
                        </div>
                      )}
                      {patient.birthDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {patient.birthDate}
                        </div>
                      )}
                    </div>
                    {patient.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {patient.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(patient)}
                      data-testid={`button-edit-${patient.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(patient.id)}
                      data-testid={`button-delete-${patient.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hasta Bilgilerini Düzenle</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-edit-fullname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="tcNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TC Kimlik Numarası</FormLabel>
                      <FormControl>
                        <Input {...field} maxLength={11} placeholder="12345678901" data-testid="input-edit-tc-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon *</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-edit-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doğum Tarihi</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-edit-birthdate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cinsiyet</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-gender">
                              <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Erkek">Erkek</SelectItem>
                            <SelectItem value="Kadın">Kadın</SelectItem>
                            <SelectItem value="Diğer">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="input-edit-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notlar</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Özel notlar, sağlık geçmişi..."
                          data-testid="input-edit-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditOpen(false);
                      setSelectedPatient(null);
                    }}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    data-testid="button-submit-edit"
                  >
                    {updateMutation.isPending ? "Kaydediliyor..." : "Güncelle"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
