import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
// import { DefaultSession } from "next-auth";
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

// Message Interface and Schema
export interface Message extends Document {
  content: string;
  createdAt: Date;
  sentiment?: number; // -1 to 1 scale
  isRead?: boolean;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
  };
}

const MessageSchema: Schema<Message> = new Schema<Message>(
  {
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: [10, "Message must be at least 10 characters"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sentiment: {
      type: Number,
      min: -1,
      max: 1,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
    },
  },
  { _id: true }
);

// interface CustomSessionUser extends DefaultSession["user"] {
//   _id: string;
// }

// User Interface and Schema
export interface User extends Document {
  name: string;
  image: string;
  username: string;
  email: string;
  password?: string; // Optional for social login users
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  verifyCode?: string;
  verifyCodeExpiry?: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  lastLogin?: Date;
  loginCount: number;
  provider: "credentials" | "google" | "github" | "discord";
  messages: Message[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const UserSchema: Schema<User> = new Schema<User>(
  {
    name: {
      type: String,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never return password in queries
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    verifyCode: String,
    verifyCodeExpiry: Date,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAcceptingMessages: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github", "discord"],
      default: "credentials",
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.verifyCode;
        delete ret.verifyCodeExpiry;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.verifyCode;
        delete ret.verifyCodeExpiry;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      },
    },
  }
);

// Indexes for faster queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ "messages.createdAt": -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ isAcceptingMessages: 1 });
UserSchema.plugin(mongooseLeanVirtuals);


// Password hashing middleware
UserSchema.pre<User>("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Password comparison method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false; // For social login users without password
  return bcrypt.compare(candidatePassword, this.password);
};

// Password reset token generator
UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  
  this.passwordResetExpires = { type: Date, index: { expires: '10m' } };
  
  return resetToken;
};

// Virtual for formatted created date
UserSchema.virtual("createdAtFormatted").get(function () {
  const createdAt: Date = this.get("createdAt");
  return createdAt
    ? createdAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
});

// Virtual for unread message count
UserSchema.virtual("unreadMessageCount").get(function () {
  return this.messages.filter((msg: Message) => !msg.isRead).length;
});

// Virtual for profile URL
UserSchema.virtual("profileUrl").get(function () {
  return `${process.env.NEXT_PUBLIC_BASE_URL}/u/${this.username}`;
});

const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;