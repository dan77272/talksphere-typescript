import { sql } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "No userId" }, { status: 400 });
  }

  await sql`
    INSERT INTO chat.queue (user_id, joined_at)
    VALUES (${userId}, NOW())
    ON CONFLICT (user_id) DO NOTHING
  `;

  const existing = await sql`
    SELECT user_id AS me_id, claimed_by AS partner_id, claimed_at
    FROM chat.queue
    WHERE user_id = ${userId}
      AND claimed_by IS NOT NULL
    LIMIT 1
  `;

  if (existing.length > 0) {
    return NextResponse.json({ ok: true, claimed: existing[0] });
  }

  const rows = await sql`
    UPDATE chat.queue AS q
    SET claimed_by = CASE
        WHEN q.user_id = ${userId} THEN p.other_id
        WHEN q.user_id = p.other_id THEN ${userId}
      END,
      claimed_at = NOW()
    FROM LATERAL (
      SELECT user_id AS other_id
      FROM chat.queue
      WHERE user_id <> ${userId}
        AND claimed_by IS NULL
      ORDER BY joined_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    ) AS p
    WHERE q.user_id IN (${userId}, p.other_id)
      AND q.claimed_by IS NULL
    RETURNING
      q.user_id AS me_id,
      q.claimed_by AS partner_id,
      q.claimed_at
  `;

  const mine = rows.find(r => r.me_id === userId) || null;

  return NextResponse.json({ ok: true, claimed: mine });
}

export async function DELETE(req: Request){
  const {roomName} = await req.json()
  await sql`
    DELETE FROM chat.queue
    WHERE user_id = ${roomName} OR claimed_by = ${roomName}
  `

  return NextResponse.json({message: 'Users cleared from queue successfully'}, {status: 200})
}

