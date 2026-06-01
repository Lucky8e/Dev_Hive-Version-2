import getUserAndRoomCode from "@/lib/getUserAndRoomCode";
import { redirect } from "next/navigation";

const page = async () => {
  const { userId, roomCode } = await getUserAndRoomCode();

  if (!userId || !roomCode) {
    redirect("/join-room");
  }
  redirect(`/workspace/${roomCode}`);
};
export default page;
