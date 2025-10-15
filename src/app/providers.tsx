'use client'

import { AblyProvider } from "ably/react";
import { chatClient, realtimeClient } from "./lib/ably";
import { ChatClientProvider } from "@ably/chat/react";

export default function Providers({children}: {children: React.ReactNode}){
    return (
        <AblyProvider client={realtimeClient}>
            <ChatClientProvider client={chatClient}>
                {children}
            </ChatClientProvider>
        </AblyProvider>
    )
}