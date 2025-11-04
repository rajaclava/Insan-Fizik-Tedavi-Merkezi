import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  UserCog,
  Package,
  CreditCard,
  ClipboardList,
  Stethoscope,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  {
    title: "Ana Panel",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Randevular",
    url: "/admin/appointments",
    icon: Calendar,
  },
  {
    title: "Blog Yönetimi",
    url: "/admin/blog",
    icon: FileText,
  },
  {
    title: "Yorumlar",
    url: "/admin/testimonials",
    icon: MessageSquare,
  },
  {
    title: "Hastalar",
    url: "/admin/patients",
    icon: Users,
  },
  {
    title: "Fizyoterapistler",
    url: "/admin/therapists",
    icon: Stethoscope,
  },
  {
    title: "Paketler",
    url: "/admin/packages",
    icon: Package,
  },
  {
    title: "Satın Almalar",
    url: "/admin/purchases",
    icon: CreditCard,
  },
  {
    title: "Tedavi Planları",
    url: "/admin/treatment-plans",
    icon: ClipboardList,
  },
  {
    title: "Seans Notları",
    url: "/admin/session-notes",
    icon: ClipboardList,
  },
  {
    title: "Kullanıcı Yönetimi",
    url: "/admin/users",
    icon: UserCog,
  },
];

export function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız",
      });
      setLocation("/admin/login");
    },
  });

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">İF</span>
          </div>
          <div>
            <h2 className="font-semibold text-sm">İnsan Fizik Tedavi</h2>
            <p className="text-xs text-muted-foreground">Yönetim Paneli</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`nav-${item.url}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Çıkış Yap
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
