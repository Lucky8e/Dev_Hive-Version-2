import { nanoid } from "nanoid";
import { supabase } from "./supabase";

export async function createRoom() {
  try {
    const roomCode = nanoid(8);
    const { data, error } = await supabase
      .from("rooms")
      .insert([{ code: roomCode }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return createRoom();
      }
      throw error;
    }
    return { success: true, room: data };
  } catch (error) {
    console.error("Error creating room:", error);
    return { success: false, error };
  }
}

export async function getRoomByCode({ roomCode }: { roomCode: string }) {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", roomCode)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Room not found" };
      }
      throw error;
    }
    return { success: true, room: data };
  } catch (error) {
    console.error("Error getting room:", error);
    return { success: false, error };
  }
}

export async function joinRoom({
  roomId,
  userId,
  userName
}: {
  roomId: string;
  userId: string;
  userName: string;
}) {
  try {
    const { data, error } = await supabase
      .from("room_participants")
      .insert([
        {
          room_id: roomId,
          user_id: userId,
          name: userName
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, participant: data };
  } catch (error) {
    console.log("Error Joining the room: ", error);
    return { success: false, error };
  }
}
