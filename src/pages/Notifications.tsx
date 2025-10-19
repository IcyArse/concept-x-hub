import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  user_id: string;
  type: "collaborator_request" | "post_comment" | "post_interest";
  data: any;
  read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setItems((data as Notification[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  const renderText = (n: Notification) => {
    switch (n.type) {
      case "collaborator_request":
        return "sent you a collaborator request";
      case "post_comment":
        return "commented on your post";
      case "post_interest":
        return "showed interest in your post";
      default:
        return "";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {loading ? (
          <Card className="p-12 text-center">Loading...</Card>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No notifications</h2>
            <p className="text-muted-foreground">You'll see notifications here when people interact with you</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <Card key={n.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={n.read ? "secondary" : "default"}>{n.type.replace("_", " ")}</Badge>
                  <div className="text-sm">
                    <div className="font-medium">
                      {renderText(n)}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

