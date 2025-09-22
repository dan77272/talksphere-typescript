import { NextRequest, NextResponse } from 'next/server'
import Pusher from 'pusher'

const pusher = new Pusher({
    appId: process.env.APP_ID!,
    key: process.env.APP_KEY!,
    secret: process.env.APP_SECRET!,
    cluster: process.env.APP_CLUSTER!
})

export async function POST(req: NextRequest){
    const {text} = await req.json()

    await pusher.trigger("my-channel", "my-event", {text})

    return NextResponse.json({ok: true})
}
