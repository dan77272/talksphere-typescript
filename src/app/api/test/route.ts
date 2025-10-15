import { sql } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(){
    const users = await sql`SELECT * FROM chat.queue`
    return NextResponse.json({data: users})
}