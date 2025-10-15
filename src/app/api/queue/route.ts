import { sql } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 });

  await sql`
    INSERT INTO chat.queue (user_id, joined_at)
    VALUES (${userId}, NOW())
    ON CONFLICT (user_id) DO NOTHING
  `;

  const rows = await sql`
    UPDATE chat.queue AS q
    SET claimed_by = CASE
        WHEN q.user_id = ${userId}      THEN p.other_id
        WHEN q.user_id = p.other_id     THEN ${userId}
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
    WHERE p.other_id IS NOT NULL            
      AND q.user_id IN (${userId}, p.other_id)
    RETURNING
      CASE WHEN q.user_id = ${userId} THEN q.user_id END AS me_id,
      p.other_id AS partner_id,
      q.claimed_by,
      q.claimed_at
  `;

  const mine = rows.find(r => r.me_id) || null;

  return NextResponse.json({ ok: true, claimed: mine });
}

