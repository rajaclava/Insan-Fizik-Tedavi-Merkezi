import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface TreatmentPlan {
  id: string;
  diagnosis: string;
  goals: string;
  exercises: string;
  notes?: string;
  createdAt: string;
}

function PatientTreatmentPlansContent() {
  const [, setLocation] = useLocation();

  const { data: plans, isLoading } = useQuery<TreatmentPlan[]>({
    queryKey: ["/api/patient/treatment-plans"],
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
            onClick={() => setLocation("/patient/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tedavi Planlarım</h1>
            <p className="text-muted-foreground">
              Fizyoterapistiniz tarafından hazırlanan tedavi planlarınız
            </p>
          </div>
        </div>

        {plans && plans.length > 0 ? (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} data-testid={`plan-${plan.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {plan.diagnosis}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Oluşturulma: {new Date(plan.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Hedefler</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {plan.goals}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Egzersizler</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {plan.exercises}
                    </p>
                  </div>
                  {plan.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notlar</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {plan.notes}
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
                Henüz tedavi planınız oluşturulmamış
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Fizyoterapistiniz size özel bir tedavi planı hazırlayacaktır
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function PatientTreatmentPlans() {
  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <PatientTreatmentPlansContent />
    </ProtectedRoute>
  );
}
