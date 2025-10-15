
import { ChatRoomProvider} from "@ably/chat/react"
import ChatBox from "./ChatBox";
import ConnectionStatus from "./ConnectionStatus";
import RoomStatus from "./RoomStatus";
import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";

interface Users{
  me_id: string;
  partner_id: string
}

export default function ChatPage() {

  const userIdRef = useRef('')
  if(!userIdRef.current){
    userIdRef.current = nanoid()
  }

  const [roomName, setRoomName] = useState(userIdRef.current)
  const [users, setUsers] = useState<Users>(() => ({} as Users))

  useEffect(() => {

    async function checkQueue(){
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId: userIdRef.current, now: new Date().toISOString()})
      })
      const data = await response.json()
      console.log(data)
      if(data.claimed){
        setRoomName(data.claimed.claimed_by)
        setUsers(data.claimed)
      }
    }
    checkQueue()
  }, [roomName])
  
  return (
    <ChatRoomProvider
      key={roomName}
      name={roomName} // The room name you want to create or join
      options={{occupancy: {enableEvents: true}}}
    >
        <div className="flex flex-row w-full border-1 border-blue-500 rounded-lg overflow-hidden mx-auto font-sans">
          <div className="flex-1 border-1 border-blue-500">
            <ConnectionStatus/>
          </div>
          <div className="flex-1 border-1 border-blue-500">
            <RoomStatus/>
          </div>
        </div>
        <ChatBox users={users}/>
    </ChatRoomProvider>
  );
}
