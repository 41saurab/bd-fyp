import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, Droplets } from "lucide-react";

const BloodDrop = () => (
	<svg viewBox="0 0 24 24" className="w-8 h-8 fill-crimson animate-heartbeat" xmlns="http://www.w3.org/2000/svg">
		<path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
	</svg>
);

export default function Login() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const [showPass, setShowPass] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm();

	const onSubmit = async (data) => {
		try {
			const res = await login(data.email, data.password);
			toast.success(`Welcome back, ${res.user.name.split(" ")[0]}!`);
			if (res.user.role === "admin") navigate("/admin/dashboard");
			else if (res.user.role === "organization") navigate("/organization/dashboard");
			else navigate("/donor/dashboard");
		} catch (err) {
			toast.error(err.response?.data?.message || "Invalid credentials");
		}
	};

	return (
		<div className="min-h-screen bg-stone-50 flex">
			{/* Left - visual */}
			<div className="hidden lg:flex flex-1 bg-gradient-to-br from-blood-900 via-crimson to-blood-700 items-center justify-center p-16 relative overflow-hidden">
				<div className="absolute inset-0">
					{[...Array(6)].map((_, i) => (
						<svg key={i} viewBox="0 0 24 24" className="absolute fill-white/5 animate-float" style={{ width: `${60 + i * 30}px`, left: `${10 + i * 15}%`, top: `${10 + (i % 3) * 25}%`, animationDelay: `${i * 0.5}s` }}>
							<path d="M12 2C12 2 4 10.5 4 15a8 8 0 0016 0C20 10.5 12 2 12 2z" />
						</svg>
					))}
				</div>
				<div className="relative text-center text-white max-w-sm">
					<div className="text-7xl mb-6">🩸</div>
					<h2 className="text-3xl font-display font-bold mb-4">Welcome Back, Hero</h2>
					<p className="font-body text-red-100 leading-relaxed">Every time you login and donate, you're potentially saving up to three lives.</p>
					<div className="mt-10 grid grid-cols-3 gap-4 text-center">
						{[
							["50K+", "Donors"],
							["8K+", "Hospitals"],
							["1M+", "Lives Saved"],
						].map(([n, l]) => (
							<div key={l}>
								<p className="text-2xl font-display font-bold">{n}</p>
								<p className="text-xs text-red-200 font-sans">{l}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Right - form */}
			<div className="flex-1 flex items-center justify-center p-8">
				<div className="w-full max-w-md">
					<div className="flex items-center gap-2 mb-8">
						<BloodDrop />
						<span className="font-display font-bold text-2xl text-stone-800">
							Blood<span className="text-crimson">Bridge</span>
						</span>
					</div>
					<h1 className="text-3xl font-display font-bold text-stone-800 mb-2">Sign In</h1>
					<p className="text-stone-500 font-body mb-8">Enter your credentials to continue</p>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div>
							<label className="label">Email Address</label>
							<input {...register("email", { required: "Email required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })} className="input-field" placeholder="Enter your email" />
							{errors.email && <p className="text-red-500 text-xs mt-1 font-sans">{errors.email.message}</p>}
						</div>
						<div>
							<label className="label">Password</label>
							<div className="relative">
								<input {...register("password", { required: "Password required" })} type={showPass ? "text" : "password"} className="input-field pr-10" placeholder="Enter password" />
								<button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
									{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								</button>
							</div>
							{errors.password && <p className="text-red-500 text-xs mt-1 font-sans">{errors.password.message}</p>}
						</div>
						<button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
							{isSubmitting ? "Signing in..." : "Sign In"}
						</button>
					</form>

					<div className="mt-8 space-y-3">
						<p className="text-sm text-stone-500 font-sans text-center">Don't have an account?</p>
						<div className="grid grid-cols-2 gap-3">
							<Link to="/register/donor" className="btn-outline text-sm text-center py-2.5">
								Register as Donor
							</Link>
							<Link to="/register/organization" className="btn-ghost text-sm text-center py-2.5 border border-stone-200 rounded-lg">
								Register Organization
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
