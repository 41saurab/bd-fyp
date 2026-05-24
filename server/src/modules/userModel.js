import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
        type: String,
        enum: ["admin", "donor", "organization"],
        required: true,
    },
    phone: { type: String },
    city: { type: String },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

export const userModel = mongoose.model("User", userSchema);
