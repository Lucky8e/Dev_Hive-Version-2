"use client";

import { useRouter } from "next/navigation";
import JoinForm from "../../my-components/Form/JoinForm";

interface User {
  id: string;
  name: string;
}
interface Room {
  id: string;
  code: string;
}

const JoinRoomPage = () => {
  const router = useRouter();

  // This is the onJoin function
  const handleJoin = (userData: User, roomData: Room) => {
    router.push(`/workspace/${roomData.code}`);
  };
  return (
    <div>
      <JoinForm onJoin={handleJoin} />
    </div>
  );
};
export default JoinRoomPage;
