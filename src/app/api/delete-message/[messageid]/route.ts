import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  try {
    // Connect to database
    await dbConnect();

    // Get session and validate
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Validate message ID format
    const messageId = params.messageid;
    if (!mongoose.isValidObjectId(messageId)) {
      return NextResponse.json(
        { success: false, message: "Invalid message ID format" },
        { status: 400 }
      );
    }

    const userId = session.user._id;
    if (!mongoose.isValidObjectId(userId!)) {
      return NextResponse.json(
        { success: false, message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Find user and pull the message
    const result = await UserModel.updateOne(
      { _id: userId, "messages._id": messageId },
      { $pull: { messages: { _id: messageId } } }
    );

    // Handle results
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "User or message not found" 
        },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Message was already deleted" 
        },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Message deleted successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}