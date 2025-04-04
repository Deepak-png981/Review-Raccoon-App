import { connectDB } from "@/db/db";
import { KnowledgeBase } from "@/models/KnowledgeBase";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/utils/authOptions";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const data = await request.json();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const entry = await KnowledgeBase.findOneAndUpdate(
      { _id: id, createdBy: session.user.id },
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error updating knowledge base entry:", error);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const entry = await KnowledgeBase.findOneAndDelete({
      _id: id,
      createdBy: session.user.id,
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting knowledge base entry:", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
