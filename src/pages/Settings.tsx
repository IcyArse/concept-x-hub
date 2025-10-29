import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Prefs {
  notify_collaborator_requests: boolean;
  notify_post_comments: boolean;
  notify_post_interests: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>({
    notify_collaborator_requests: true,
    notify_post_comments: true,
    notify_post_interests: true,
  });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await (supabase as any)
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          notify_collaborator_requests: data.notify_collaborator_requests,
          notify_post_comments: data.notify_post_comments,
          notify_post_interests: data.notify_post_interests,
        });
      }
    };
    load();
  }, [user]);

  const updatePref = async (key: keyof Prefs, value: boolean) => {
    if (!user) return;
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    await (supabase as any)
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...newPrefs });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose which updates you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Collaborator Requests</Label>
                <p className="text-sm text-muted-foreground">When someone adds you as a collaborator</p>
              </div>
              <Switch
                checked={prefs.notify_collaborator_requests}
                onCheckedChange={(v) => updatePref("notify_collaborator_requests", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Post Comments</Label>
                <p className="text-sm text-muted-foreground">When someone comments on your post</p>
              </div>
              <Switch
                checked={prefs.notify_post_comments}
                onCheckedChange={(v) => updatePref("notify_post_comments", v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Post Interests</Label>
                <p className="text-sm text-muted-foreground">When someone shows interest in your post</p>
              </div>
              <Switch
                checked={prefs.notify_post_interests}
                onCheckedChange={(v) => updatePref("notify_post_interests", v)}
              />
            </div>

            <div className="pt-4">
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

