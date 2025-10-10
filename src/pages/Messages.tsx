import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender?: Profile;
}

interface Conversation {
  id: string;
  updated_at: string;
  other_participant?: Profile;
  last_message?: Message;
}

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadConversations = async () => {
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user!.id);

    if (!participations) return;

    const conversationIds = participations.map(p => p.conversation_id);
    
    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .in("id", conversationIds)
      .order("updated_at", { ascending: false });

    if (!convos) return;

    const conversationsWithDetails = await Promise.all(
      convos.map(async (convo) => {
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convo.id)
          .neq("user_id", user!.id)
          .single();

        if (participants) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", participants.user_id)
            .single();

          const { data: lastMsg } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...convo,
            other_participant: profile,
            last_message: lastMsg
          };
        }
        return convo;
      })
    );

    setConversations(conversationsWithDetails);
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      const messagesWithProfiles = await Promise.all(
        data.map(async (msg) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", msg.sender_id)
            .single();

          return { ...msg, sender: profile || undefined };
        })
      );
      setMessages(messagesWithProfiles);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            sender_id: payload.new.sender_id,
            sender: profile || undefined
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedConversation,
      sender_id: user!.id,
      content: newMessage.trim()
    });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-[calc(100vh-8rem)] flex gap-4">
          {/* Conversations List */}
          <Card className="w-80 p-4">
            <h2 className="text-xl font-bold mb-4">Messages</h2>
            <ScrollArea className="h-[calc(100%-4rem)]">
              <div className="space-y-2">
                {conversations.map((convo) => (
                  <div
                    key={convo.id}
                    onClick={() => setSelectedConversation(convo.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === convo.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={convo.other_participant?.avatar_url} />
                        <AvatarFallback>
                          {convo.other_participant?.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {convo.other_participant?.username}
                        </p>
                        <p className="text-sm truncate opacity-75">
                          {convo.last_message?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No conversations yet. Start a chat from a user's profile!
                  </p>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender_id === user!.id ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender?.avatar_url} />
                          <AvatarFallback>
                            {message.sender?.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user!.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type a message..."
                    />
                    <Button onClick={sendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Messages;
