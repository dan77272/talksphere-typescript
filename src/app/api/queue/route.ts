import { sql } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "No userId" }, { status: 400 });
  }

  const [result] = await sql.transaction([
    sql`
      INSERT INTO chat.queue (user_id, joined_at)
      VALUES (${userId}, NOW())
      ON CONFLICT (user_id) DO NOTHING
      RETURNING user_id
    `,

    sql`
      SELECT user_id AS me_id, claimed_by AS partner_id, claimed_at
      FROM chat.queue
      WHERE user_id = ${userId}
        AND claimed_by IS NOT NULL
      LIMIT 1
    `,

    sql`
      WITH partner AS (
        SELECT user_id AS partner_id
        FROM chat.queue
        WHERE user_id <> ${userId}
          AND claimed_by IS NULL
        ORDER BY joined_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      ),
      update_me AS (
        UPDATE chat.queue
        SET claimed_by = partner.partner_id,
            claimed_at = NOW()
        FROM partner
        WHERE chat.queue.user_id = ${userId}
          AND chat.queue.claimed_by IS NULL
        RETURNING chat.queue.user_id AS me_id, chat.queue.claimed_by AS partner_id, chat.queue.claimed_at
      ),
      update_partner AS (
        UPDATE chat.queue
        SET claimed_by = ${userId},
            claimed_at = NOW()
        FROM partner
        WHERE chat.queue.user_id = partner.partner_id
          AND chat.queue.claimed_by IS NULL
        RETURNING chat.queue.user_id
      )
      SELECT * FROM update_me
    `,
  ]);

  const existing = result[1];
  const matched = result[2];

  if (existing.length > 0) {
    return NextResponse.json({ ok: true, claimed: existing[0] });
  }

  return NextResponse.json({
    ok: true,
    claimed: matched[0] || null,
  });
}

export async function DELETE(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "No userId" }, { status: 400 });
  }

  await sql`
    DELETE FROM chat.queue
    WHERE user_id = ${userId}
       OR claimed_by = ${userId}
  `;

  return NextResponse.json({ message: "Users cleared from queue successfully" });
}