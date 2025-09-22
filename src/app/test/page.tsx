'use client'

import Pusher from "pusher-js"
import { useEffect, useState } from "react"

export default function Test(){

    const [text, setText] = useState('')
    const [messages, setMessages] = useState<string[]>([])

    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_APP_KEY!, {
            cluster: process.env.NEXT_PUBLIC_APP_CLUSTER,
            disableStats: true
        })

        const channel = pusher.subscribe("my-channel")

        channel.bind("my-event", (data) => {
            setMessages(m => [...m, data.text])
        })

        return () => {
            pusher.unsubscribe('my-channel')
            pusher.disconnect()
        }
    }, [])


    async function send() {
        await fetch('/api/send', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({text})
        })

        setText('')
    }

    return (
        <div>
            <div>
                {messages.map((m, index) => (
                    <p key={index}>{m}</p>
                ))}
            </div>
            <div>
                <input type="text" value={text} onChange={e => setText(e.target.value)}/>
                <button onClick={send}>Send</button>
            </div>
        </div>
    )
}