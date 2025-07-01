import { NextResponse } from "next/server";

export function apiResponse<T>(
  success: boolean,
  message: string,
  data?: T,
  status: number = 200
) {
  return NextResponse.json(data !== null && data !== undefined
    ? { success, message, data }
    : { success, message },
  { status }
  )}