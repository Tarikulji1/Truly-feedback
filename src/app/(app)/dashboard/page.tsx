"use client";
import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message } from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import {
  Loader2,
  RefreshCcw,
  Copy,
  Link,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: session, status } = useSession();

  // Setup react-hook-form with zod validation
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessage: false,
    },
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessage");

  // Set the base URL for sharing links
  useEffect(() => {
    setBaseUrl(
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}`
        : "")
    );
  }, []);

  // Delete message handler
  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
    toast.success("Message deleted successfully");
  };

  // Fetch acceptance status
  const fetchAcceptedMessage = useCallback(async () => {
    try {
      setIsSwitchLoading(true);
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessage", response.data.isAcceptingMessage || false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || "Failed to fetch acceptance status"
      );
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  // Fetch messages
  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    try {
      setIsLoading(true);
      setIsRefreshing(refresh);

      const response = await axios.get<ApiResponse>("/api/get-messages");
      setMessages(response.data.messages || []);

      if (refresh) {
        toast.success("Messages refreshed successfully");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || "Failed to fetch messages"
      );
    } finally {
      setIsLoading(false);
      setIsSwitchLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchMessages();
      fetchAcceptedMessage();
    }
  }, [status, fetchMessages, fetchAcceptedMessage]);

  // Handle switch toggle
  const handleSwitchChange = async (checked: boolean) => {
    try {
      setIsSwitchLoading(true);
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: checked,
      });
      setValue("acceptMessage", checked);
      toast.success(response.data.message || "Settings updated");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || "Failed to update settings"
      );
    } finally {
      setIsSwitchLoading(false);
    }
  };

  // Copy profile link to clipboard
  const copyToClipboard = () => {
    if (!session?.user) return;
    const profileUrl = `${baseUrl}/u/${session.user.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile URL copied successfully");
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          <p className="text-gray-600">Loading your Dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (status !== "authenticated" || !session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6 max-w-md text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please sign in to access your dashboard
          </p>
          <Button onClick={() => (window.location.href = "/sign-in")}>
            Go to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  // Extract username safely
  const { username } = session.user as User;
  const profileUrl = `${baseUrl}/u/${username}`;

  // Main dashboard UI
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 max-w-6xl w-full">
      {/* Dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center space-x-4 mb-6">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                )}
                <div>
                  <h1 className="text-2xl font-bold">
                    {session.user.name || session.user.username}
                  </h1>
                </div>
              </div>
              <CardTitle className="text-lg font-semibold mb-2">
                Your Profile Link
              </CardTitle>
              <div className="flex space-x-2">
                <Input value={profileUrl} readOnly className="flex-1" />
                <Button onClick={copyToClipboard} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium">Accept Messages</h3>
                  <p className="text-sm text-gray-500">
                    {acceptMessages ? "Enabled" : "Disabled"}
                  </p>
                </div>
                {isSwitchLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <Switch
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                  />
                )}
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">Share Options</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
                    <Link className="mr-2 h-4 w-4" /> Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Messages */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Messages</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => fetchMessages(true)}
                  disabled={isLoading || isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="mr-2 animate-spin h-4 w-4" />
                  ) : (
                    <RefreshCcw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
              <p>
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </p>
            </CardHeader>

            <Separator />

            <CardContent className="mt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <MessageCard
                      key={message._id as string}
                      message={message}
                      onMessageDelete={handleDeleteMessage}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                  <p className="text-gray-500 max-w-md">
                    Share your profile link to start receiving anonymous feedback.
                    Your messages will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
