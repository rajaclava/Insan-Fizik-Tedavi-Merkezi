import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SessionNote, InsertSessionNote, Appointment, Therapist } from "@shared/schema";
import { insertSessionNoteSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, FileText, Calendar, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const sessionNoteFormSchema = insertSessionNoteSchema.extend({
  painScale: z.number().min(0).max(10).nullable(),
});

type SessionNoteFormData = z.infer<typeof sessionNoteFormSchema>;

export default function AdminSessionNotes() {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<SessionNote | null>(null);

  const { data: notes = [], isLoading } = useQuery<SessionNote[]>({
    queryKey: ["/api/session-notes"],
  });

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: therapists = [] } = useQuery<Therapist[]>({
    queryKey: ["/api/therapists"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertSessionNote) => {
      return apiRequest("POST", "/api/session-notes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-notes"] });
      setCreateOpen(false);
      toast({ title: "Başarılı", description: "Seans notu oluşturuldu" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Seans notu oluşturulamadı", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertSessionNote> }) => {
      return apiRequest("PATCH", `/api/session-notes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-notes"] });
      setEditOpen(false);
      toast({ title: "Başarılı", description: "Seans notu güncellendi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Seans notu güncellenemedi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/session-notes/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session-notes"] });
      toast({ title: "Başarılı", description: "Seans notu silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Seans notu silinemedi", variant: "destructive" });
    },
  });

  const createForm = useForm<SessionNoteFormData>({
    resolver: zodResolver(sessionNoteFormSchema),
    defaultValues: {
      appointmentId: "",
      therapistId: "",
      noteText: "",
      painScale: null,
      rom: null,
      attachments: null,
    },
  });

  const editForm = useForm<SessionNoteFormData>({
    resolver: zodResolver(sessionNoteFormSchema),
    defaultValues: {
      appointmentId: "",
      therapistId: "",
      noteText: "",
      painScale: null,
      rom: null,
      attachments: null,
    },
  });

  const handleCreateSubmit = (data: SessionNoteFormData) => {
    const cleanedData: InsertSessionNote = {
      appointmentId: data.appointmentId,
      therapistId: data.therapistId,
      noteText: data.noteText,
      painScale: data.painScale,
      rom: data.rom,
      attachments: data.attachments,
    };
    createMutation.mutate(cleanedData);
  };

  const handleEditSubmit = (data: SessionNoteFormData) => {
    if (selectedNote) {
      const cleanedData: InsertSessionNote = {
        appointmentId: data.appointmentId,
        therapistId: data.therapistId,
        noteText: data.noteText,
        painScale: data.painScale,
        rom: data.rom,
        attachments: data.attachments,
      };
      updateMutation.mutate({ id: selectedNote.id, data: cleanedData });
    }
  };

  const handleEdit = (note: SessionNote) => {
    setSelectedNote(note);
    editForm.reset({
      appointmentId: note.appointmentId,
      therapistId: note.therapistId,
      noteText: note.noteText,
      painScale: note.painScale,
      rom: note.rom,
      attachments: note.attachments,
    });
    setEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu seans notunu silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  const getAppointmentInfo = (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return "Bilinmiyor";
    return `${appointment.name} - ${appointment.date} ${appointment.startTime}`;
  };

  const getTherapistName = (therapistId: string) => {
    const therapist = therapists.find((t) => t.id === therapistId);
    return therapist ? therapist.title : "Bilinmiyor";
  };

  const getPainBadge = (painScale: number | null) => {
    if (painScale === null) return <Badge variant="outline">Belirtilmedi</Badge>;
    if (painScale >= 7) return <Badge className="bg-red-500">Yüksek ({painScale}/10)</Badge>;
    if (painScale >= 4) return <Badge className="bg-yellow-500">Orta ({painScale}/10)</Badge>;
    return <Badge className="bg-green-500">Düşük ({painScale}/10)</Badge>;
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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Seans Notu Yönetimi</h1>
          <p className="text-muted-foreground">Toplam {notes.length} seans notu</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} data-testid="button-add-note">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Seans Notu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card key={note.id} data-testid={`card-note-${note.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {note.createdAt ? format(new Date(note.createdAt), "dd.MM.yyyy HH:mm") : "Tarih yok"}
                    </span>
                  </div>
                  {getPainBadge(note.painScale)}
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(note)}
                    data-testid={`button-edit-${note.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(note.id)}
                    data-testid={`button-delete-${note.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Randevu:</span>
                    <p className="text-muted-foreground">{getAppointmentInfo(note.appointmentId)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Terapist:</span>
                  <span>{getTherapistName(note.therapistId)}</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-muted-foreground line-clamp-3">{note.noteText}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Seans Notu Oluştur</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="appointmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Randevu *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-appointment">
                          <SelectValue placeholder="Randevu seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointments.map((appointment) => (
                          <SelectItem key={appointment.id} value={appointment.id}>
                            {appointment.name} - {appointment.date} {appointment.startTime}
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
                name="noteText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seans Notları *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Seansın detaylarını yazın..."
                        data-testid="input-note-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="painScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ağrı Seviyesi (0-10)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="10"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="0 (yok) - 10 (çok şiddetli)"
                        data-testid="input-pain-scale"
                      />
                    </FormControl>
                    <FormDescription>Hastanın bildirdiği ağrı seviyesi</FormDescription>
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seans Notu Düzenle</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="appointmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Randevu *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-appointment-edit">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointments.map((appointment) => (
                          <SelectItem key={appointment.id} value={appointment.id}>
                            {appointment.name} - {appointment.date} {appointment.startTime}
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
                name="noteText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seans Notları *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        data-testid="input-note-text-edit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="painScale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ağrı Seviyesi (0-10)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        max="10"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        data-testid="input-pain-scale-edit"
                      />
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
