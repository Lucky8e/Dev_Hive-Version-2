import { Input } from "@/components/ui/input";
import { MessageCircleCode, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Tables } from "@/types/supabase";
import { getRoomMessage, sendMessage } from "@/lib/chatServices";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createAvatar } from "@dicebear/core";
import { openPeeps } from "@dicebear/collection";

type ChatMessage = Tables<"chat_messages">;

type ChatComponentProps = {
  roomId: string;
  userId: string;
  userName: string;
};

const ChatComponent = ({ roomId, userId, userName }: ChatComponentProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  //----------------------------Get the messages at the render----------------------------//
  useEffect(() => {
    const fetchMessages = async () => {
      const result = await getRoomMessage(roomId);
      if (result.success) {
        setMessages(result.messages);
        setTimeout(scrollToBottom, 100);
      }
    };
    fetchMessages();
  }, [roomId]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //---------------------------Handle sending the new messages---------------------------//
  const handleSendMessages = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageToClear = newMessage;
    setNewMessage("");

    setIsSending(true);
    const result = await sendMessage({
      roomId: roomId,
      userId: userId,
      userName: userName,
      message: messageToClear
    });
    if (!result.success) {
      setNewMessage(messageToClear);
    }
    setIsSending(false);
  };

  //---------------------------Subscribe to the real-time message updates---------------------------//
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}:chat`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return (
    <div className="h-full bg-background flex flex-col">
      {/*-----------------Header Section-----------------*/}
      <div className="flex items-center p-4 space-x-2 border-b-2 border-slate-700 ">
        <MessageCircleCode className="text-primary" />
        <h3 className="text-foreground text-lg font-semibold">Live Chat</h3>
      </div>
      {/*-----------------Chat Section-----------------*/}
      <div className="flex-1 bg-background overflow-y-auto p-4 space-y-6  ">
        {messages.length === 0 ? (
          <div className="text-center text-sm font-semibold mt-8">
            No messages yet. Start the conversation
          </div>
        ) : (
          messages.map((msg, index) => {
            const prevMessage = messages[index - 1];
            const isCurrentUser = msg.user_id === userId;
            const isSameUser = prevMessage?.user_id === msg.user_id;
            const avatarUrl = createAvatar(openPeeps, {
              seed: msg.user_id
            }).toDataUri();
            return (
              <div
                key={msg.id}
                className={`flex flex-col  ${msg.user_id === userId ? "items-end" : "items-start"}`}
              >
                {/* Name and time */}

                {!isSameUser && (
                  <div
                    className={`flex items-center gap-2 mb-2 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="overflow-visible" size="default">
                      <AvatarImage src={avatarUrl} alt={userName} />
                      <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-base font-semibold">
                      {isCurrentUser ? "You" : msg.user_name}{" "}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      {msg.created_at &&
                        new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                    </span>
                  </div>
                )}
                {/* Message text */}
                <div
                  className={`max-w-[80%] rounded-3xl px-3 py-2 wrap-break-word text-base leading-7 text-white
                  ${msg.user_id === userId ? "bg-primary rounded-tr-sm" : "bg-slate-800 rounded-tl-sm"}`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>
      {/*-----------------Type and send Section-----------------*/}
      <div className="border-t-2 border-slate-700 py-5  ">
        <form onSubmit={handleSendMessages} className="flex gap-1 items-center">
          <Input
            type="text"
            placeholder="Type Message...."
            className="ml-2 rounded-3xl h-12"
            value={newMessage}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessages(e as any);
              }
            }}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="flex items-center justify-center rounded-full"
            size={"icon"}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
export default ChatComponent;
