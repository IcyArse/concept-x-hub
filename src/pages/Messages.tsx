import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        
        <Card className="p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
          <p className="text-muted-foreground">
            Start conversations with other creators from the Happening feed
          </p>
        </Card>
      </div>
    </Layout>
  );
}
