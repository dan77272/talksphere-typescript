
import { ChatMessageEvent, ChatMessageEventType, Message } from "@ably/chat";
import { useChatClient, useMessages, useOccupancy, useRoom, useTyping } from "@ably/chat/react";
import { useEffect, useState } from "react";
import { chatClient, userId } from "../lib/ably";
import { nanoid } from "nanoid";
import { IoIosSend } from "react-icons/io";
import { FaStop, FaCheck, FaPlus} from "react-icons/fa";
import { ImCross } from "react-icons/im";

interface Users{
  me_id: string;
  partner_id: string
}

export default function ChatBox({users, setRoomName, clientId}: {users: Users, setRoomName: React.Dispatch<React.SetStateAction<string>>, clientId: string}) {

  const [inputValue, setInputValue] = useState('');
  // State to hold the messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [occupancy, setOccupancy] = useState(1)
  const [occupancyMessage, setOccupancyMessage] = useState('Looking for someone to chat with...')
  const [leftMessage, setLeftMessage] = useState('')
  const [disableChat, setDisableChat] = useState(false)
  const [toggleStop, setToggleStop] = useState('stop')

  const [currentRoomStatus, setCurrentRoomStatus] = useState('');


  useEffect(() => {
    const chatBox = document.getElementById('chatbox')
    chatBox?.scrollTo({top: chatBox.scrollHeight, behavior: "smooth"})
  }, [messages])

  
  const {roomName} = useRoom({
    onStatusChange: (status) => {
      setCurrentRoomStatus(status.current); // Update the room status
      if(status.current === 'released') setToggleStop('new')
    },
  });

  const { connections } = useOccupancy({
    listener: (occupancyEvent) => {
      console.log('Number of users connected is: ', occupancyEvent.occupancy.connections);
      if(occupancyEvent.occupancy.connections > occupancy){
         setOccupancy(occupancyEvent.occupancy.connections)
         setOccupancyMessage("You're now chatting with a random stranger.")
      }else if(occupancyEvent.occupancy.connections < occupancy){
        setOccupancy(occupancyEvent.occupancy.connections)
        setLeftMessage("Stranger has left the chat.")
        setToggleStop('new')
      }
    },
  });

  // The useMessages hook subscribes to messages in the room and provides a send method
  const { sendMessage } = useMessages({
    listener: (event: ChatMessageEvent) => {
      const message = event.message;
      switch (event.type) {
        case ChatMessageEventType.Created: {
          // Add the new message to the list
          setMessages((prevMessages) => [...prevMessages, message]);
          break;
        }
        default: {
          console.error('Unhandled event', event);
        }
      }
    }
  });

  const { currentlyTyping, keystroke, stop } = useTyping();
  const typingClientIds = Array.from(currentlyTyping).filter((id) => id !== clientId);


  /* replace the existing handleSend method with the following */
  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage({text: inputValue.trim()}).catch((err) =>
      console.error('Error sending message', err))
    setInputValue('');
    if(toggleStop === 'sure') setToggleStop('stop')
    /* stop typing when the message is sent */
    stop().catch((err) => console.error('Error stopping typing', err))
  };

  /* add the following method to handle input changes */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue.trim().length > 0) {
      // If the input value is not empty, start typing
      keystroke().catch(
        (err) => console.error('Error starting typing', err))
    } else {
      // If the input is cleared, stop typing
      stop().catch(
        (err) => console.error('Error stopping typing', err))
    }
  };

  async function handleLeaveRoom(){
    await chatClient.rooms.release(roomName)
    const res = await fetch('/api/queue', {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({roomName: roomName})
    })
    const data = await res.json()
    console.log(data)
    setDisableChat(true)
  }

  async function handleNewChat(){
    const newRoomName = nanoid()
    setRoomName(newRoomName)
  }

  return (
  <div className="bg-[#fff6ed] flex flex-1 flex-col items-center max-lg:min-h-dvh min-h-[700px]">
    <div className="bg-white w-[98%] mx-auto my-3 rounded-lg p-2 flex-1 overflow-y-auto relative" id="chatbox">
      <p className="font-semibold">{occupancyMessage}</p>
      {messages.map((msg: Message) => {
        const isMine = msg.clientId === userId;
        return (
          <div key={msg.serial} className={`max-w-[60%] mb-1`}>
            {isMine ? <p className="font-semibold"><span className="text-blue-800">You: </span>{msg.text}</p> : <p className="font-semibold"><span className="text-red-600">Stranger: </span>{msg.text}</p>}
          </div>
        );
      })}
    <p className="font-semibold">{connections < 2 && leftMessage}</p>
    {currentRoomStatus === 'released' && <p className="font-semibold">Chat ended.</p>}
    <div className="sticky bottom-0 bg-white w-full">
        {typingClientIds.length > 0  && (
          <p className="text-sm text-gray-700 overflow-hidden">
            Stranger is typing...
          </p>
        )}
      </div>
    </div>
  <div className="max-lg:sticky max-lg:bottom-0 w-full flex max-lg:items-center max-lg:justify-center
                  bg-[#fff6ed]
                  max-lg:pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]
                  max-lg:pt-2">
        {toggleStop === 'stop' ?
        <button className="p-1 border-1 bg-gray-100 cursor-pointer lg:w-24 max-lg:rounded-full left-7 top-1/2 max-lg:-translate-y-1/2 max-lg:absolute max-lg:p-2" onClick={() => setToggleStop('sure')}>
          <FaStop className="lg:hidden"/>
          <p className="max-lg:hidden">Stop</p>
        </button>
        : toggleStop === 'sure' ?
        <div>
          <button className="p-1 border-1 bg-gray-100 cursor-pointer lg:w-24 max-lg:rounded-full left-18 top-1/2 max-lg:-translate-y-1/2 max-lg:absolute max-lg:p-2 lg:h-full" onClick={handleLeaveRoom}>
            <FaCheck className="lg:hidden"/>
            <p className="max-lg:hidden">Are you sure?</p>
          </button>
          <button className="lg:hidden p-1 border-1 bg-gray-100 cursor-pointer lg:w-24 max-lg:rounded-full left-7 top-1/2 max-lg:-translate-y-1/2 max-lg:absolute max-lg:p-2" onClick={() => setToggleStop('stop')}>
            <ImCross/>
          </button>
        </div>
        : toggleStop === 'new' && <button className="p-1 border-1 bg-gray-100 cursor-pointer lg:w-24 max-lg:rounded-full left-7 top-1/2 max-lg:-translate-y-1/2 max-lg:absolute max-lg:p-2" onClick={handleNewChat}>
            <FaPlus className="lg:hidden"/>
            <p className="max-lg:hidden">New Chat</p>
          </button>}
      <textarea
        disabled={connections < 2 || disableChat}
        placeholder="Type your message..."
        className={`lg:flex-1 border outline-none bg-white lg:px-2 py-1 resize-none max-lg:w-full max-lg:mx-5 max-lg:rounded-full ${toggleStop === 'sure' ? 'px-24' : 'px-14'}`}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleSend();
          }
        }}
      />
      <button
        disabled={connections < 2 || disableChat}
        className={`lg:p-8 border-1 bg-gray-100 max-lg:rounded-full max-lg:absolute right-7 top-1/2 max-lg:-translate-y-1/2 p-2 ${connections < 2 && 'cursor-not-allowed'}`}
        onClick={handleSend}
      >
        <IoIosSend className="lg:hidden"/>
        <p className="max-lg:hidden">Send</p>
      </button>
    </div>
  </div>
  );
}