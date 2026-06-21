import { ChatRoomProvider, useChatClient } from "@ably/chat/react";
import ChatBox from "./ChatBox";
import { useEffect, useState } from "react";

export default function ChatPage({
  setOnlineCount,
}: {
  setOnlineCount: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const { clientId } = useChatClient();

  const [roomName, setRoomName] = useState<string>("");

  useEffect(() => {
    if (!clientId || roomName) return;

    const interval = setInterval(async () => {
      const response = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: clientId }),
      });

      const data = await response.json();

      if (data.claimed?.partner_id) {
        const matchedRoomName = [clientId, data.claimed.partner_id]
          .sort()
          .join("-");

        setRoomName(matchedRoomName);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [clientId, roomName]);

  if (!roomName) {
    return <p>Looking for someone to chat with...</p>;
  }

  return (
    <ChatRoomProvider
      key={roomName}
      name={roomName}
      options={{ occupancy: { enableEvents: true } }}
    >
      <ChatBox
        setRoomName={setRoomName}
        clientId={clientId}
        setOnlineCount={setOnlineCount}
      />
    </ChatRoomProvider>
  );
}