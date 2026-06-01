import { supabase } from "./supabase";

/* --------------------------------Get all the users------------------------------------ */
export async function getActiveUsers(roomId: string) {
  try {
    const { data, error } = await supabase
      .from("room_participants")
      .select("*")
      .eq("room_id", roomId)
      .eq("is_active", true);

    if (error) {
      throw error;
    }
    return { success: true, users: data };
  } catch (error) {
    console.log("Error fetching the users", error);
    return { success: false, error };
  }
}

/* -------------------------------- Mark the users active ------------------------------------ */
export async function markUsersActive(userId: string, roomId: string) {
  try {
    const { error } = await supabase
      .from("room_participants")
      .update({
        last_seen_at: new Date().toISOString(),
        is_active: true
      })
      .eq("user_Id", userId)
      .eq("room_Id", roomId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.log("Error updating the user", error);
    return { success: false, error };
  }
}

/* -------------------------------- Mark the users inactive ------------------------------------ */
export async function markUsersInactive(userId: string, roomId: string) {
  try {
    const { error } = await supabase
      .from("room_participants")
      .update({
        is_active: false
      })
      .eq("user_Id", userId)
      .eq("room_Id", roomId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.log("Error updating the user", error);
    return { success: false, error };
  }
}
