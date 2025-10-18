
import { ChatRoomProvider, useChatClient} from "@ably/chat/react"
import ChatBox from "./ChatBox";
import { useEffect, useState } from "react";

export default function ChatPage() {

  // const userIdRef = useRef('')
  // if(!userIdRef.current){
  //   userIdRef.current = nanoid()
  // }


  const {clientId} = useChatClient()
  const [roomName, setRoomName] = useState(clientId)

  useEffect(() => {

    async function checkQueue(){
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId: roomName, now: new Date().toISOString()})
      })
      const data = await response.json()
      console.log(data)
      if(data.claimed){
        setRoomName(data.claimed.claimed_by)
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
        {/* <div className="flex flex-row w-full border-1 border-blue-500 rounded-lg overflow-hidden mx-auto font-sans">
          <div className="flex-1 border-1 border-blue-500 max-lg:hidden">
            <ConnectionStatus/>
          </div>
          <div className="flex-1 border-1 border-blue-500 max-lg:hidden">
            <RoomStatus/>
          </div>
        </div> */}
        <ChatBox setRoomName={setRoomName} clientId={clientId}/>
    </ChatRoomProvider>
  );
}
