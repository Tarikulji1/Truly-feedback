import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server"; 
import mongoose from "mongoose";


export async function GET(request:Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({
                success: false,
                message: "Not Authenticated"
            }, {status:401})
        }
        
        // Validate and convert user ID
        const userId = session.user._id;
        if (!mongoose.Types.ObjectId.isValid(userId!)) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID format"},
                { status: 400 }
            );
        }
        const objectId = new mongoose.Types.ObjectId(userId);

        // Fetch user with sorted messages
        const user = await UserModel.findById(objectId).select("messages.content messages.createdAt").lean();
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status:404}
            )
        }
        const messages = (user.messages ?? []) as { content: string; createdAt: Date | string }[];
        const sortedMessages = messages.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return NextResponse.json(
            {
                success: true,
                messages: sortedMessages,
            },
            {status:200}
        );
    } catch (error) {
        console.error("Error fetching messages: ", error)
        return NextResponse.json({
            success: false,
            message: "Internal server while fethcing messages"
        },
        {status:500});
    }
}