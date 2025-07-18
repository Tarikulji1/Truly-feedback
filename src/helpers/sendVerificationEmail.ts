import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
      await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: "Truly Feedback | Verification Code",
          react: VerificationEmail({username, otp: verifyCode}),
        });
        
    return { success: true, message: "Verification email send successfully" };
        
  } catch (emailError) {
    console.error(`Error sending email to ${email}`, emailError);
    return { success: false, message: "Failed to send verification email" };
  }
}
