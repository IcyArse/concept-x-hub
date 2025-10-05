import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";

export default function Notifications() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        
        <Card className="p-12 text-center">
          <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No notifications</h2>
          <p className="text-muted-foreground">
            You'll see notifications here when people interact with your posts
          </p>
        </Card>
      </div>
    </Layout>
  );
}
