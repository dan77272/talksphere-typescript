import { nanoid } from "nanoid"
import { useEffect, useRef } from "react"

export default function ChatTest(){

    const id = useRef('')
    if(!id.current) id.current = nanoid() 

    // useEffect(() => {

    //     const pusher = new Pusher(process.env.NEXT_PUBLIC_APP_KEY!, {
    //         cluster: process.env.NEXT_PUBLIC_APP_CLUSTER,
    //         authEndpoint: '/api/auth',
    //         disableStats: true
    //     });

    //     pusher.connection.bind("connected", async () => {
    //         const socketId = pusher.connection.socket_id

    //         const res = await fetch('/api/queue', {
    //             method: 'POST',
    //             headers: {'Content-Type': 'application/json'},
    //             body: JSON.stringify({userId: id, socketId})
    //         })

    //         const data = await res.json()
    //     })

    //     return () => {
    //         pusher.unsubscribe('channel')
    //         pusher.disconnect()
    //     }
    // }, [])


    return (
        <div className="bg-[#fff6ed] flex flex-1 relative">
            {/* <div className="bg-white w-full mx-4 mt-4 mb-28 rounded-lg p-2">
                {messages.map((m, index) => (
                    <p key={index} className="font-semibold">{m}</p>
                ))}
            </div>
            <div className="absolute bottom-0 w-full flex">
                <button className="p-8 border-1 bg-gray-100 cursor-pointer">Stop</button>
                <textarea value={text} onChange={e => setText(e.target.value)} className="flex-1 border outline-none bg-white px-2 py-1 resize-none align-top "/>
                <button onClick={send} className={`p-8 border-1 bg-gray-100  ${activeChat ? "cursor-pointer" : "cursor-not-allowed"}`}>Send</button>
            </div> */}
        </div>
    )
}