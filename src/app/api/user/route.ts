import { connectDB } from "@/db/db"
import { User } from "@/models/User"
import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    const { email, name, googleId } = await request.json()
    const userId = uuidv4()

    try {
        await connectDB()
        
        const existingUser = await User.findOne({ 
            $or: [
                { email: email },
                { googleId: googleId }
            ]
        });

        if (existingUser) {
            return NextResponse.json({ 
                message: "User already exists", 
                user: existingUser 
            }, { status: 200 });
        }
        
        const user = await User.create({ email, name, googleId, userId })
        return NextResponse.json({ 
            message: "User created successfully", 
            user 
        }, { status: 201 })

    } catch (error) {
        console.log(error)
        return NextResponse.json({ 
            error: "Failed to create user",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}
