"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default function ChatListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchRooms();
  }, [session]);

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/chat/rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>

          {loading ? (
            <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" /></div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No conversations</h2>
              <p className="text-gray-500">Start chatting with vendors or customers</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rooms.map((room: any) => {
                const otherMembers = room.members?.filter((m: any) => m.userId !== session?.user?.id) || [];
                const name = otherMembers.map((m: any) => m.user?.name).join(", ") || room.name;
                const lastMessage = room.messages?.[0];
                const initial = name?.[0]?.toUpperCase() || "?";

                return (
                  <Link key={room.id} href={`/chat/${room.id}`}>
                    <Card className="hover:shadow-md transition cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{name}</p>
                          {lastMessage && (
                            <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>
                          )}
                        </div>
                        {lastMessage && (
                          <p className="text-xs text-gray-400 flex-shrink-0">{timeAgo(lastMessage.createdAt)}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
