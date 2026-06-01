"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRoom, getRoomByCode, joinRoom } from "@/lib/roomService";
import { Hash, User } from "lucide-react";
import { nanoid } from "nanoid";
import { Black_Ops_One } from "next/font/google";
import { useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";

interface JoinFormProps {
  onJoin: (user: UserData, room: Room) => void;
}

interface UserData {
  id: string;
  name: string;
}
interface Room {
  id: string;
  code: string;
}
const blackOps = Black_Ops_One({
  subsets: ["latin"],
  weight: ["400"] // choose the weight you need
});

const JoinForm = ({ onJoin }: JoinFormProps) => {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  //-------------------------------------------------handleCreateRoom-------------------------------------------------------//
  const handleCreateRoom = async () => {
    if (!name.trim()) {
      toast.warning("Please enter you name");
      return;
    }
    setLoading(true);

    try {
      const userId = nanoid(5);

      //Create the room
      const roomResult = await createRoom();
      if (!roomResult.success || !roomResult.room) {
        toast.warning("Failed to create room");
        return;
      }
      //join the room
      const joinResult = await joinRoom({
        roomId: roomResult.room.id,
        userId: userId,
        userName: name.trim()
      });
      if (!joinResult.success) {
        toast("Failed to join the room");
        return;
      }

      Cookies.set("userId", userId, { expires: 1 });
      Cookies.set("userName", name.trim(), { expires: 1 });
      Cookies.set("roomCode", roomResult.room.code, { expires: 1 });
      Cookies.set("roomId", roomResult.room.id, { expires: 1 });

      onJoin(
        { id: userId, name: name.trim() },
        { id: roomResult.room.id, code: roomResult.room.code }
      );
    } catch (error) {
      toast.error("Something went wrong please try again.");
    } finally {
      setLoading(false);
    }
  };

  //-------------------------------------------------handleCreateRoom-------------------------------------------------------//
  const handleJoinRoom = async () => {
    if (!name.trim()) {
      toast.warning("Please enter the name");
      return;
    }
    if (!roomCode.trim()) {
      toast.warning("Please enter the valid room code");
      return;
    }
    setLoading(true);

    try {
      const userId = nanoid(5);
      //check if room exist
      const roomResult = await getRoomByCode({ roomCode: roomCode });
      if (!roomResult.success || !roomResult.room) {
        toast.error("Room not found. Check the code and try again.");
        return;
      }
      const joinResult = await joinRoom({
        roomId: roomResult.room.id,
        userId: userId,
        userName: name
      });
      if (!joinResult.success) {
        toast.warning("Failed to join room");
        return;
      }
      Cookies.set("userId", userId, { expires: 1 });
      Cookies.set("userName", name.trim(), { expires: 1 });
      Cookies.set("roomCode", roomResult.room.code, { expires: 1 });
      Cookies.set("roomId", roomResult.room.id, { expires: 1 });

      onJoin(
        { id: userId, name: name.trim() },
        { id: roomResult.room.id, code: roomResult.room.code }
      );
    } catch (error) {
      toast.error("Something went wrong please try again");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-hero-glow">
      <div className="flex flex-col items-center justify-center p-8 rounded-lg shadow-xl max-w-4xl w-full">
        <h1 className="text-5xl text-muted-foreground font-bold mb-2">
          Welcome To{" "}
        </h1>
        <h1
          className={`${blackOps.className} text-6xl font-bold mb-2 bg-linear-to-r
             from-violet-400
             via-purple-500
             to-indigo-600
               bg-clip-text 
               text-transparent`}
        >
          DevHive
        </h1>
        <p
          className="text-xl font-bold uppercase  
               bg-size[200%_200%]
               animate-pulse
               bg-linear-to-r
             from-sky-400
             via-indigo-500
             to-fuchsia-500
               bg-clip-text text-transparent"
        >
          Collaborate in real time
        </p>

        {/* form component */}
        <div className="w-full max-w-md space-y-4 mt-8 p-4">
          <div className="space-y-6">
            <label className="text-muted-foreground text-sm font-medium mb-2 block capitalize">
              Enter your name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 pl-10 text-foreground "
              />
            </div>
            <label className="text-sm text-muted-foreground font-medium mb-2 block capitalize">
              Enter room code
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full h-14 pl-10 text-foreground"
              />
            </div>
          </div>
          <div className="flex items-center justify-between px-4">
            <Button
              className="h-12 hover:bg-purple-400"
              onClick={handleCreateRoom}
              disabled={loading}
            >
              Create Room
            </Button>
            <Button
              className="h-12 hover:bg-purple-400"
              onClick={handleJoinRoom}
              disabled={loading}
            >
              Join Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default JoinForm;
