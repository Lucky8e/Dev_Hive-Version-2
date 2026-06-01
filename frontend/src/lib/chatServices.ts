import { Tables } from "@/types/supabase";
import { supabase } from "./supabase";
import { error } from "console";

//---------------------------Send Messages---------------------------//
interface SendMessageProps {
  roomId: string;
  userId: string;
  userName: string;
  message: string;
}
export async function sendMessage({
  roomId,
  userId,
  userName,
  message
}: SendMessageProps) {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          room_id: roomId,
          user_id: userId,
          user_name: userName,
          message: message.trim()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, message: data };
  } catch (error) {
    console.log("Error sending the messages: ", error);
    return { success: false, error };
  }
}

//---------------------------Get all the Messages from Room---------------------------//
type ChatMessage = Tables<"chat_messages">;
export async function getRoomMessage(
  roomId: string
): Promise<
  | { success: true; messages: ChatMessage[] }
  | { success: false; error: unknown }
> {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { success: true, messages: data || [] };
  } catch (error) {
    console.log("Error getting the messages: ", error);
    return { success: false, error };
  }
}
