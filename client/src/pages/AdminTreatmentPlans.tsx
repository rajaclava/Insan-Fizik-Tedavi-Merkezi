import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TreatmentPlan, InsertTreatmentPlan, Patient, Therapist } from "@shared/schema";
import { insertTreatmentPlanSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, FileText, User, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminTreatmentPlans() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);

  const { data: plans = [], isLoading } = useQuery<TreatmentPlan[]>({
    queryKey: ["/api/treatment-plans"],
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: therapists = [] } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTreatmentPlan) => {
      return apiRequest("POST", "/api/treatment-plans", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-plans"] });
      setCreateOpen(false);
      toast({ title: "Başarılı", description: "Tedavi planı oluşturuldu" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Tedavi planı oluşturulamadı", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTreatmentPlan> }) => {
      return apiRequest("PATCH", `/api/treatment-plans/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-plans"] });
      setEditOpen(false);
      toast({ title: "Başarılı", description: "Tedavi planı güncellendi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Tedavi planı güncellenemedi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/treatment-plans/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/treatment-plans"] });
      toast({ title: "Başarılı", description: "Tedavi planı silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Tedavi planı silinemedi", variant: "destructive" });
    },
  });

  const createForm = useForm<InsertTreatmentPlan>({
    resolver: zodResolver(insertTreatmentPlanSchema),
    defaultValues: {
      patientId: "",
      therapistId: "",
      name: "",
      totalSessions: 1,
      completedSessions: 0,
      description: "",
    },
  });

  const editForm = useForm<InsertTreatmentPlan>({
    resolver: zodResolver(insertTreatmentPlanSchema),
    defaultValues: {
      patientId: "",
      therapistId: "",
      name: "",
      totalSessions: 1,
      completedSessions: 0,
      description: "",
    },
  });

  const handleCreateSubmit = (data: InsertTreatmentPlan) => {
    const cleanedData = {
      ...data,
      description: data.description || undefined,
    };
    createMutation.mutate(cleanedData);
  };

  const handleEditSubmit = (data: InsertTreatmentPlan) => {
    if (selectedPlan) {
      const cleanedData = {
        ...data,
        description: data.description || undefined,
      };
      updateMutation.mutate({ id: selectedPlan.id, data: cleanedData });
    }
  };

  const handleEdit = (plan: TreatmentPlan) => {
    setSelectedPlan(plan);
    editForm.reset({
      patientId: plan.patientId,
      therapistId: plan.therapistId,
      name: plan.name,
      totalSessions: plan.totalSessions,
      completedSessions: plan.completedSessions,
      description: plan.description || "",
    });
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu tedavi planını silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.fullName : "Bilinmiyor";
  };

  const getTherapistName = (therapistId: string) => {
    const therapist = therapists.find((t) => t.id === therapistId);
    return therapist ? therapist.title : "Bilinmiyor";
  };

  const getProgressBadge = (completed: number, total: number) => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) {
      return <Badge className="bg-green-500">Tamamlandı</Badge>;
    } else if (percentage > 50) {
      return <Badge className="bg-blue-500">Devam Ediyor</Badge>;
    } else {
      return <Badge className="bg-yellow-500">Başlangıç</Badge>;
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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Tedavi Planı Yönetimi</h1>
          <p className="text-muted-foreground">Toplam {plans.length} tedavi planı</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} data-testid="button-add-plan">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Tedavi Planı
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} data-testid={`card-plan-${plan.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{plan.name}</CardTitle>
                  {getProgressBadge(plan.completedSessions, plan.totalSessions)}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(plan)}
                    data-testid={`button-edit-${plan.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(plan.id)}
                    data-testid={`button-delete-${plan.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Hasta:</span>
                  <span>{getPatientName(plan.patientId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Terapist:</span>
                  <span>{getTherapistName(plan.therapistId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Seans:</span>
                  <span>{plan.completedSessions} / {plan.totalSessions}</span>
                </div>
                {plan.description && (
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Tedavi Planı Oluştur</DialogTitle>
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
                name="therapistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terapist *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-therapist">
                          <SelectValue placeholder="Terapist seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {therapists.map((therapist) => (
                          <SelectItem key={therapist.id} value={therapist.id}>
                            {therapist.title}
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Adı *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Örn: Sırt Ağrısı Tedavisi" data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="totalSessions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toplam Seans *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-total-sessions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value || ""} placeholder="Tedavi planı açıklaması" data-testid="input-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                  Kaydet
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tedavi Planı Düzenle</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasta *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-patient-edit">
                          <SelectValue />
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
                control={editForm.control}
                name="therapistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terapist *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-therapist-edit">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {therapists.map((therapist) => (
                          <SelectItem key={therapist.id} value={therapist.id}>
                            {therapist.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Adı *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-name-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="totalSessions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Toplam Seans *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-total-sessions-edit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="completedSessions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamamlanan Seans *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-completed-sessions-edit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                  Güncelle
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
