'use client'

import { useState } from "react";
import HomePage from "./components/Home";
import Navbar from "./components/Navbar";
import ChatPage from "./components/Chat";

export default function Home() {

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
    {isOpen ?
      <div className="h-screen min-h-[700px] flex flex-col">
        <Navbar/>
        <ChatPage/>
      </div> 
    : 
      <div className="h-screen min-h-[700px] flex flex-col">
        <Navbar/>
        <HomePage isOpen={isOpen} setIsOpen={setIsOpen}/>
      </div>
    }
    </>

  );
}
