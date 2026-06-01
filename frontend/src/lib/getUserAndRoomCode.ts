import { cookies } from "next/headers";

async function getUserAndRoomCode() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userName = cookieStore.get("userName")?.value;
  const roomCode = cookieStore.get("roomCode")?.value;

  return { userId, roomCode, userName };
}
export default getUserAndRoomCode;
