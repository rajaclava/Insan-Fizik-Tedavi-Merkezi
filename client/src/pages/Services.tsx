import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import manualTherapyImage from "@assets/generated_images/Manual_therapy_service_image_90be64cf.png";
import orthoRehabImage from "@assets/generated_images/Orthopedic_rehabilitation_service_image_60ec52b1.png";
import scoliosisImage from "@assets/generated_images/Scoliosis_treatment_service_image_50477469.png";
import herniaImage from "@assets/generated_images/Neck_back_hernia_service_59d1ed4f.png";
import neuroRehabImage from "@assets/generated_images/Neurological_rehabilitation_service_image_38e0b90e.png";
import heroImage from "@assets/generated_images/Hero_physiotherapy_session_image_66c498cf.png";

export default function Services() {
  const services = [
    {
      id: "fizik-tedavi",
      title: "Fizik Tedavi",
      description: "Fizik tedavi, kas-iskelet sistemi rahatsızlıkları, ağrı yönetimi ve hareket kısıtlılıklarının tedavisinde kullanılan etkili bir yöntemdir. Uzman fizyoterapistlerimiz, kişiye özel tedavi programları hazırlayarak hastaların günlük yaşam aktivitelerini rahatça yapabilmelerini sağlar. Elektroterapi, ultrason, sıcak-soğuk uygulama gibi modern fizik tedavi modalitelerini kullanarak ağrınızı azaltır ve iyileşme sürecinizi hızlandırırız. Sporcu yaralanmaları, ameliyat sonrası rehabilitasyon, kronik ağrı tedavisi ve postür bozuklukları gibi birçok alanda hizmet veriyoruz.",
      image: heroImage,
    },
    {
      id: "manuel-terapi",
      title: "Manuel Terapi",
      description: "Manuel terapi, el teknikleriyle yapılan özel bir tedavi yaklaşımıdır. Eklem mobilitesini artırmak, kas gerginliğini azaltmak ve ağrıyı gidermek amacıyla uygulanan bu yöntem, özellikle boyun ve bel ağrılarında oldukça etkilidir. Sertifikalı manuel terapistlerimiz, hassas değerlendirmeler yaparak problemin kaynağını tespit eder ve uygun tedavi tekniklerini uygular. Manipülasyon, mobilizasyon ve yumuşak doku teknikleriyle kaslarınızı gevşetir, eklemlerinizin hareketliliğini artırır. Baş ağrıları, omuz problemleri, diz ağrıları gibi birçok kas-iskelet sistemi rahatsızlığının tedavisinde başarılı sonuçlar elde ediyoruz.",
      image: manualTherapyImage,
    },
    {
      id: "ortopedik-rehabilitasyon",
      title: "Ortopedik Rehabilitasyon",
      description: "Ortopedik rehabilitasyon, kemik, kas, eklem ve bağ dokusu yaralanmaları sonrası iyileşme sürecini destekleyen kapsamlı bir tedavi programıdır. Ameliyat sonrası bakım, kırık iyileşmesi, bağ yaralanmaları ve protez sonrası rehabilitasyon konularında uzmanlaşmış ekibimiz, hastalarımızın en kısa sürede normal yaşamlarına dönmelerini hedefler. Kuvvet artırıcı egzersizler, propriyoseptif eğitim, denge çalışmaları ve fonksiyonel aktiviteler içeren özel programlarımızla tam iyileşme sağlıyoruz. Her hastanın durumu bireysel olarak değerlendirilir ve tedavi planı kişiye özel hazırlanır.",
      image: orthoRehabImage,
    },
    {
      id: "skolyoz-tedavisi",
      title: "Skolyoz Tedavisi",
      description: "Skolyoz, omurganın yana doğru eğrilmesi durumudur ve özellikle çocukluk ve ergenlik döneminde görülür. Erken teşhis ve doğru tedavi yaklaşımıyla skolyozun ilerlemesi önlenebilir. Schroth metodunu uygulayan uzman fizyoterapistlerimiz, skolyoz tipine ve derecesine uygun özel egzersiz programları hazırlar. Postür eğitimi, solunum egzersizleri, kas kuvvetlendirme ve gerileme çalışmalarıyla omurga eğriliğinin düzeltilmesine yardımcı oluyoruz. Hem yetişkin hem de pediatrik skolyoz vakalarında deneyimli kadromuzla, hastalarımızın yaşam kalitesini artırmayı amaçlıyoruz. Düzenli takip ve egzersiz programlarıyla uzun vadeli başarı sağlıyoruz.",
      image: scoliosisImage,
    },
    {
      id: "bel-boyun-fitigi",
      title: "Bel ve Boyun Fıtığı Tedavisi",
      description: "Bel ve boyun fıtığı, omurga diskleri arasındaki yumuşak dokunun dışarı çıkması sonucu oluşan ve şiddetli ağrılara neden olan bir rahatsızlıktır. Konservatif tedavi yaklaşımımızla ameliyatsız iyileşme sağlamayı hedefliyoruz. Manuel terapi teknikleri, traksiyon uygulamaları, postür düzeltme egzersizleri ve core kuvvetlendirme programlarıyla fıtık semptomlarını azaltıyoruz. McKenzie egzersizleri ve nöral mobilizasyon teknikleriyle sinirlere binen baskıyı azaltarak ağrıyı gideriyoruz. Ergonomi eğitimleriyle günlük yaşamda nelere dikkat edilmesi gerektiğini öğretiyoruz. Akut ve kronik fıtık vakalarında başarılı tedavi sonuçları elde ediyoruz.",
      image: herniaImage,
    },
    {
      id: "norolojik-rehabilitasyon",
      title: "Nörolojik Rehabilitasyon",
      description: "Nörolojik rehabilitasyon, beyin ve sinir sistemi hastalıkları sonucu oluşan hareket ve fonksiyon kayıplarının tedavisinde uygulanan özel bir rehabilitasyon programıdır. İnme (felç), Parkinson hastalığı, Multiple Skleroz, spinal kord yaralanmaları gibi nörolojik durumların tedavisinde uzmanlaşmış fizyoterapistlerimiz, modern tedavi teknikleriyle hizmet vermektedir. Bobath, PNF (Propriyoseptif Nöromusküler Fasilitasyon) gibi nörorehabilitasyon yaklaşımlarını uyguluyoruz. Denge ve yürüme eğitimi, ince motor beceri geliştirme, günlük yaşam aktivitelerinde bağımsızlık kazandırma hedeflerimiz arasındadır. Multidisipliner yaklaşımla hastalarımızın maksimum potansiyellerine ulaşmalarını sağlıyoruz.",
      image: neuroRehabImage,
    },
  ];

  const whatsappNumber = "905326127244";
  const getWhatsAppUrl = (service: string) => {
    const message = `Merhaba, ${service} hakkında bilgi almak istiyorum.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div>
      <SEO
        title="Hizmetlerimiz"
        description="Fizik tedavi, manuel terapi, ortopedik rehabilitasyon, skolyoz tedavisi, bel-boyun fıtığı ve nörolojik rehabilitasyon hizmetlerimiz hakkında detaylı bilgi alın."
        path="/hizmetler"
      />
      <section className="py-16 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold mb-4 text-foreground" data-testid="text-services-page-title">
              Hizmetlerimiz
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Modern ekipmanlarımız ve uzman kadromuzla geniş bir yelpazede fizik tedavi ve rehabilitasyon
              hizmeti sunuyoruz. Her hastamıza özel tedavi programları hazırlıyoruz.
            </p>
          </div>

          <div className="space-y-12">
            {services.map((service, index) => (
              <Card key={service.id} id={service.id} className="overflow-hidden hover-elevate" data-testid={`card-service-detail-${service.id}`}>
                <div className={`grid grid-cols-1 ${index % 2 === 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-0`}>
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover min-h-[300px]"
                    />
                  </div>
                  <div className={`p-8 flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-2xl lg:text-3xl">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {service.description}
                      </p>
                      <Button
                        variant="default"
                        size="default"
                        asChild
                        data-testid={`button-whatsapp-${service.id}`}
                      >
                        <a href={getWhatsAppUrl(service.title)} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp ile Bilgi Al
                        </a>
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
