import { connectDB } from "@/db/db";
import { KnowledgeBase } from "@/models/KnowledgeBase";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/utils/authOptions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;

    const entries = await KnowledgeBase.find({
      $or: [
        { createdBy: userId },
        { 'access.allowedUsers': userId },
        { 'access.type': 'organization', 'access.organizationId': session.user.organizationId }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching knowledge base entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const entry = await KnowledgeBase.create({
      ...data,
      createdBy: session.user.id,
      access: {
        type: 'private',
        allowedUsers: [],
        allowedTeams: [],
        organizationId: null
      }
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating knowledge base entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
} 