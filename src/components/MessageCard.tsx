"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import {
  X,
  Trash2,
  Heart,
  ThumbsUp,
  Reply,
  Copy,
  Clock,
  Loader2,
} from "lucide-react";
import { Message } from "@/model/User";
import { toast } from "sonner";
import axios from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );
      toast.success(response.data.message || "Message deleted successfully.");
      onMessageDelete(message._id as string);
    } catch (error) {
      toast.error("Failed to delete message. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied to clipboard");
  };

  const handleLike = () => {
    toast.success("Message liked");
    // Implement actual like functionality
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      {/* Delete button */}
      <div className="absolute top-3 right-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              aria-label="Delete message"
              variant="destructive"
              size="icon"
              className="w-8 h-8 rounded-full"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className={isDeleting ? "opacity-50 pointer-events-none" : ""}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this message?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                message from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium line-clamp-1">
          Anonymous Message
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm">
          <Clock className="w-4 h-4" />
          {message.createdAt
            ? formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
              })
            : "Unknown time"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[100px]">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9"
            onClick={handleLike}
          >
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9"
            onClick={() => toast.info("Reply functionality coming soon")}
          >
            <Reply className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyToClipboard}
          className="text-muted-foreground"
        >
          <Copy className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default MessageCard;
