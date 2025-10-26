import { Target, Eye, Award, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import heroImage from "@assets/generated_images/Hero_physiotherapy_session_image_66c498cf.png";

export default function About() {
  return (
    <div>
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold mb-6 text-foreground" data-testid="text-about-title">
              Hakkımızda
            </h1>
            <p className="text-lg text-muted-foreground">
              İnsan Fizik Tedavi ve Rehabilitasyon Merkezi olarak, modern tıbbın imkanlarını geleneksel yaklaşımlarla
              birleştirerek hastalarımıza en iyi hizmeti sunmayı amaçlıyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img
                src={heroImage}
                alt="Fizik Tedavi Merkezi"
                className="rounded-lg shadow-lg w-full"
                data-testid="img-about-clinic"
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold mb-4 text-foreground">Kimiz?</h2>
              <p className="text-muted-foreground mb-4">
                2008 yılından bu yana İstanbul Büyükçekmece'de hizmet veren merkezimiz, deneyimli fizyoterapist
                kadrosu ve modern ekipmanlarıyla binlerce hastanın sağlığına kavuşmasına yardımcı olmuştur.
              </p>
              <p className="text-muted-foreground mb-4">
                Fizik tedavi ve rehabilitasyon alanında ulusal ve uluslararası sertifikalara sahip uzmanlarımız,
                sürekli gelişen medikal bilgi birikimini takip ederek, hastalarımıza en güncel tedavi yöntemlerini
                uygular.
              </p>
              <p className="text-muted-foreground">
                Hasta odaklı yaklaşımımız, her bireyin benzersiz ihtiyaçlarına özel tedavi planları oluşturmamızı
                sağlar. Ekip olarak, sadece semptomları tedavi etmekle kalmaz, aynı zamanda problemin kök nedenini
                bularak uzun vadeli çözümler sunarız.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover-elevate" data-testid="card-mission">
              <CardHeader>
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-2xl">Misyonumuz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Hastalarımızın yaşam kalitesini artırmak, ağrısız ve sağlıklı bir yaşam sürmelerini sağlamak için
                  en iyi fizik tedavi ve rehabilitasyon hizmetlerini sunmak. Modern tıbbın tüm imkanlarını kullanarak,
                  bireysel ihtiyaçlara özel, kanıta dayalı tedaviler uygulamak.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-vision">
              <CardHeader>
                <Eye className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-2xl">Vizyonumuz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fizik tedavi ve rehabilitasyon alanında Türkiye'nin en güvenilir ve tercih edilen merkezlerinden
                  biri olmak. Sürekli gelişim, yenilikçi yaklaşımlar ve hasta memnuniyeti odaklı hizmet anlayışımızla
                  sektörde öncü konumda yer almak.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-values">
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-2xl">Değerlerimiz</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Profesyonellik ve uzmanlık</li>
                  <li>• Hasta odaklı yaklaşım</li>
                  <li>• Etik değerlere bağlılık</li>
                  <li>• Sürekli gelişim ve eğitim</li>
                  <li>• Güven ve şeffaflık</li>
                  <li>• Kaliteli hizmet anlayışı</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-approach">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-2xl">Tedavi Yaklaşımımız</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bütüncül bir değerlendirme yaparak, sadece semptomları değil, problemin kök nedenini tespit
                  ediyoruz. Kanıta dayalı uygulamalar ve kişiye özel tedavi programlarıyla maksimum iyileşme hedefliyoruz.
                  Hastalarımızı tedavi sürecinin aktif bir parçası yapıyor, eğitim ve ev egzersiz programlarıyla
                  destekliyoruz.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center bg-accent rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Hizmetlerimiz Hakkında Daha Fazla Bilgi Alın</h2>
            <p className="text-muted-foreground mb-6">
              Fizik tedavi ve rehabilitasyon hizmetlerimiz hakkında detaylı bilgi almak ve randevu oluşturmak için
              bizimle iletişime geçebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default" size="lg" asChild data-testid="button-services">
                <Link href="/hizmetler">Hizmetlerimiz</Link>
              </Button>
              <Button variant="outline" size="lg" asChild data-testid="button-appointment">
                <Link href="/randevu">Randevu Al</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
