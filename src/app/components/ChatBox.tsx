'use client'

import { ChatMessageEvent, ChatMessageEventType, Message } from "@ably/chat";
import { useMessages, useOccupancy, useRoom, useTyping } from "@ably/chat/react";
import { useState } from "react";
import { chatClient, userId } from "../lib/ably";

interface Users{
  me_id: string;
  partner_id: string
}

export default function ChatBox({users}: {users: Users}) {

  const [inputValue, setInputValue] = useState('');
  // State to hold the messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [occupancy, setOccupancy] = useState(1)
  const [occupancyMessage, setOccupancyMessage] = useState('Looking for someone to chat with...')
  const [leftMessage, setLeftMessage] = useState('')
  const [disableChat, setDisableChat] = useState(false)

  const { connections } = useOccupancy({
    listener: (occupancyEvent) => {
      console.log('Number of users connected is: ', occupancyEvent.occupancy.connections);
      if(occupancyEvent.occupancy.connections > occupancy){
         setOccupancy(occupancyEvent.occupancy.connections)
         setOccupancyMessage("You're now chatting with a random stranger.")
      }else if(occupancyEvent.occupancy.connections < occupancy){
        setOccupancy(occupancyEvent.occupancy.connections)
        setLeftMessage("Stranger has left the chat.")
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

  /* replace the existing handleSend method with the following */
  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage({text: inputValue.trim()}).catch((err) =>
      console.error('Error sending message', err))
    setInputValue('');

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
    await chatClient.rooms.release('my-first-room')
    setDisableChat(true)
  }

  return (
  <div className="bg-[#fff6ed] flex flex-1 relative">
    <div className="bg-white w-full mx-4 mt-4 mb-28 rounded-lg p-2 relative">
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
    <div className="h-6 px-2 pt-2 absolute bottom-2">
        {currentlyTyping.size > 0 && (
          <p className="text-sm text-gray-700 overflow-hidden">
            {Array.from(currentlyTyping).join(', ')}
            {' '}
            {currentlyTyping.size > 1 ? 'are' : 'is'} typing...
          </p>
        )}
      </div>
    </div>
    <div className="absolute bottom-0 w-full flex">
        <button className="p-8 border-1 bg-gray-100 cursor-pointer" onClick={handleLeaveRoom}>Stop</button>
      <textarea
        disabled={connections < 2 || disableChat}
        placeholder="Type your message..."
        className="flex-1 border outline-none bg-white px-2 py-1 resize-none align-top"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleSend();
          }
        }}
      />
      <button
        disabled={connections < 2 || disableChat}
        className={`p-8 border-1 bg-gray-100 ${connections < 2 && 'cursor-not-allowed'}`}
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  </div>
  );
}