import { Award, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Team() {
  const team = [
    {
      id: "1",
      name: "Fzt. Ayşe Demir",
      title: "Kurucu Fizyoterapist",
      bio: "15 yılı aşkın deneyime sahip uzman fizyoterapistimiz. Manuel terapi ve ortopedik rehabilitasyon alanında sertifikalıdır. Ankara Üniversitesi Fizik Tedavi ve Rehabilitasyon bölümü mezunu.",
      initials: "AD",
    },
    {
      id: "2",
      name: "Fzt. Mehmet Yılmaz",
      title: "Uzman Fizyoterapist",
      bio: "Spor yaralanmaları ve nörolojik rehabilitasyon konularında uzmanlaşmış, 10 yıllık deneyime sahip fizyoterapist. Hacettepe Üniversitesi mezunu, Bobath sertifikalı.",
      initials: "MY",
    },
    {
      id: "3",
      name: "Fzt. Zeynep Kaya",
      title: "Pediatrik Fizyoterapist",
      bio: "Çocuk sağlığı ve gelişimsel gerilikler konusunda uzman. Skolyoz tedavisi ve pediatrik rehabilitasyon alanında Schroth metodu sertifikasına sahip. 8 yıllık deneyimli.",
      initials: "ZK",
    },
    {
      id: "4",
      name: "Fzt. Can Özkan",
      title: "Uzman Fizyoterapist",
      bio: "Bel ve boyun fıtığı tedavisinde McKenzie metodunu uygulayan, manuel terapi ve myofasyal gevşetme tekniklerinde uzman fizyoterapist. İstanbul Üniversitesi mezunu.",
      initials: "CÖ",
    },
  ];

  return (
    <div>
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold mb-4 text-foreground" data-testid="text-team-title">
              Uzman Kadromuz
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Deneyimli ve sertifikalı fizyoterapistlerimiz, en güncel tedavi yöntemlerini kullanarak size
              sağlıklı bir yaşam sunmak için çalışıyor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {team.map((member) => (
              <Card key={member.id} className="hover-elevate text-center" data-testid={`card-team-${member.id}`}>
                <CardContent className="pt-8">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-32 w-32">
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="text-xl font-semibold mb-1 text-foreground">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.title}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover-elevate" data-testid="card-expertise">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Award className="h-12 w-12 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Uzmanlık Alanlarımız</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Manuel Terapi Sertifikası</li>
                      <li>• Bobath Nörorehabilitasyon</li>
                      <li>• McKenzie Metodu</li>
                      <li>• Schroth Skolyoz Tedavisi</li>
                      <li>• Kinezyolojik Bantlama</li>
                      <li>• Pilates Eğitmenliği</li>
                      <li>• Spor Fizyoterapisti Sertifikası</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-education">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <GraduationCap className="h-12 w-12 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">Eğitim ve Gelişim</h3>
                    <p className="text-muted-foreground mb-4">
                      Ekibimiz sürekli eğitim ve gelişim programlarına katılarak, fizik tedavi alanındaki
                      en son gelişmeleri takip eder ve hastalarına en güncel tedavi yöntemlerini sunar.
                    </p>
                    <p className="text-muted-foreground">
                      Ulusal ve uluslararası kongrelere düzenli katılım, yurt içi ve yurt dışı sertifika
                      programları, akademik araştırma ve yayınlar ekibimizin profesyonel gelişiminin
                      önemli parçalarıdır.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
