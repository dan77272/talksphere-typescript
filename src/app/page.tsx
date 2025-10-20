'use client'

import { useState } from "react";
import HomePage from "./components/Home";
import Navbar from "./components/Navbar";
import ChatPage from "./components/Chat";

export default function Home() {

  const [isOpen, setIsOpen] = useState(false)
  const [onlineCount, setOnlineCount] = useState<number | null>(null)


  return (
    <>
    {isOpen ?
      <div className="min-h-dvh h-screen flex flex-col bg-[#fff6ed]">
        <Navbar onlineCount={onlineCount}/>
        <ChatPage setOnlineCount={setOnlineCount}/>
      </div> 
    : 
      <div className="min-h-dvh flex flex-col">
        <Navbar onlineCount={onlineCount}/>
        <HomePage isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
    }
    </>

  );
}
