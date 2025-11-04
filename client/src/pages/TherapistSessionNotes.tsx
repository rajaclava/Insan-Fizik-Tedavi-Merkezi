import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, Activity } from "lucide-react";

interface SessionNote {
  id: string;
  patientId: string;
  sessionDate: string;
  chiefComplaint: string;
  assessment: string;
  treatment: string;
  homeExercises?: string;
  nextSession?: string;
  createdAt: string;
}

export default function TherapistSessionNotes() {
  const [, setLocation] = useLocation();

  const { data: notes, isLoading } = useQuery<SessionNote[]>({
    queryKey: ["/api/therapist/session-notes"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="text-center">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/therapist/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Seans Notlarım</h1>
            <p className="text-muted-foreground">
              Hastalarınızla yaptığınız seansların kayıtları
            </p>
          </div>
        </div>

        {notes && notes.length > 0 ? (
          <div className="grid gap-4">
            {notes.map((note) => (
              <Card key={note.id} data-testid={`note-${note.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Seans - {new Date(note.sessionDate).toLocaleDateString("tr-TR")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Kayıt: {new Date(note.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Şikayet</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {note.chiefComplaint}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Değerlendirme</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {note.assessment}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Uygulanan Tedavi</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {note.treatment}
                    </p>
                  </div>
                  {note.homeExercises && (
                    <div>
                      <h3 className="font-semibold mb-2">Ev Egzersizleri</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {note.homeExercises}
                      </p>
                    </div>
                  )}
                  {note.nextSession && (
                    <div>
                      <h3 className="font-semibold mb-2">Sonraki Seans</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(note.nextSession).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Henüz seans notunuz bulunmuyor
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Yönetici panelinden seans notları ekleyebilirsiniz
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
