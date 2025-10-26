import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const whatsappNumber = "905326127244";
  const message = "Merhaba, bilgi almak istiyorum.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg transition-all hover:scale-110 animate-pulse"
      data-testid="button-whatsapp"
      aria-label="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
