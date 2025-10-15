'use client'

import { ChatClient, LogLevel } from '@ably/chat';
import * as Ably from 'ably';
import { nanoid } from 'nanoid';

export const userId = nanoid()

const realtimeClient = new Ably.Realtime({
    key: process.env.NEXT_PUBLIC_API_KEY,
    clientId: userId
})

export const chatClient = new ChatClient(realtimeClient, {
    logLevel: LogLevel.Info
})

export {realtimeClient}