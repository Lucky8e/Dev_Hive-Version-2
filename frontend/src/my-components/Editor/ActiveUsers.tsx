import { getActiveUsers } from "@/lib/userPresenceService";
import { Tables } from "@/types/supabase";
import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarGroupCount
} from "@/components/ui/avatar";

import { createAvatar } from "@dicebear/core";
import { openPeeps } from "@dicebear/collection";
import { formatDistanceToNowStrict } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { Users } from "lucide-react";

interface ActiveUserProps {
  userId: string;
  roomId: string;
}
type User = Tables<"room_participants">;

const ActiveUsers = ({ userId, roomId }: ActiveUserProps) => {
  const [users, setUsers] = useState<User[]>();

  useEffect(() => {
    fetchUsers();
  }, [roomId]);

  const fetchUsers = async () => {
    const result = await getActiveUsers(roomId);
    if (result.success) {
      setUsers(result.users || []);
      console.log(users?.length);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}:users`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_participants",
          filter: `room_id=eq.${roomId}`
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return (
    <div className="h-full overflow-auto bg-background py-4 ">
      {/* -------------------------Header section------------------------- */}
      <h3 className="text-muted-foreground font-semibold text-lg mb-3 justify-between flex items-center gap-2 px-4">
        <div className="flex items-center gap-2">
          <Users />
          <span>Online Users</span>
        </div>
        <AvatarGroup>
          {users?.slice(0, 3).map((user) => {
            const avatarUrl = createAvatar(openPeeps, {
              seed: user.user_id
            }).toDataUri();
            return (
              <Avatar key={user.id}>
                <AvatarImage src={avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            );
          })}
          {users && users.length > 3 && (
            <AvatarGroupCount>+{users.length - 3}</AvatarGroupCount>
          )}
        </AvatarGroup>
      </h3>
      <Separator className="bg-primary" />
      {/* -------------------------Participants section------------------------- */}
      <div className="space-y-2 px-4 mt-3">
        {users?.map((user) => {
          const avatarUrl = createAvatar(openPeeps, {
            seed: user.user_id
          }).toDataUri();
          return (
            <div key={user.id} className="flex items-center gap-3">
              {/*-------Avatar-------*/}
              <div>
                <Avatar className="overflow-visible" size="default">
                  <AvatarImage src={avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  <AvatarBadge className="bg-green-600 dark:bg-green-800 animate-pulse" />
                </Avatar>
              </div>
              {/*-------Name and time-------*/}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-foreground ml-1 font-medium">
                    {user.name}
                  </span>
                  {user.user_id === userId && (
                    <span className="text-sm text-primary font-medium">
                      (You)
                    </span>
                  )}
                </div>
                <div className="flex text-muted-foreground">
                  <span className="text-xs">
                    Joined :{" "}
                    {user.joined_at
                      ? formatDistanceToNowStrict(new Date(user.joined_at!), {
                          addSuffix: true
                        })
                      : null}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ActiveUsers;
