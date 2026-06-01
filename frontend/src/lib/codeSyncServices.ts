import { supabase } from "./supabase";

interface SaveCodeProps {
  roomId: string;
  code: string;
  language?: string;
}

//--------------------------------------SAVE the latest code---------------------------------------//
export async function saveCode({
  roomId,
  code,
  language = "javascript"
}: SaveCodeProps) {
  try {
    const { data, error } = await supabase
      .from("code_snapshots")
      .insert([
        {
          room_id: roomId,
          code,
          language
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return { success: true, snapshot: data };
  } catch (error) {
    console.log("Error saving the code", error);
    return { success: false, error };
  }
}

//--------------------------------------GET the latest code---------------------------------------//
export async function getLatestCode(roomId: string) {
  try {
    const { data, error } = await supabase
      .from("code_snapshots")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No code saved yet
      if (error.code === "PGRST116") {
        return { success: true, code: "console.log('Hello World')" };
      }
      throw error;
    }
    return { success: true, code: data?.code, language: data?.language };
  } catch (error) {
    console.error("Error getting the latest code: ", error);
    return { success: false, error };
  }
}
