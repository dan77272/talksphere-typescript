'use client'

import { useRoom } from "@ably/chat/react";
import { useState } from "react";

export default function RoomStatus() {
  // This component will display the current room status
  const [currentRoomStatus, setCurrentRoomStatus] = useState('');
  const {roomName} = useRoom({
    onStatusChange: (status) => {
      setCurrentRoomStatus(status.current); // Update the room status
    },
  });
  return (
    <div className="p-4 text-center h-full border-gray-300 bg-gray-100">
      <h2 className="text-lg font-semibold text-blue-500">Room Status</h2>
      <p className="mt-2">Status: {currentRoomStatus}
        <br/>
        Room: {roomName}
      </p>
    </div>
  );
}