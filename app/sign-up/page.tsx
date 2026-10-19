'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser, syncUserWithDb } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verification step state
  const [stage, setStage] = useState<'form' | 'verify'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Loading & error states
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setIsLoading(true);
      const origin = window.location.origin;
      const { data, error } = await insforge.auth.signUp({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
        redirectTo: `${origin}/auth/callback`,
      });

      if (error) {
        setErrorMessage(error.message || 'Đăng ký tài khoản không thành công.');
        return;
      }

      if (data?.requireEmailVerification) {
        // Backend requires 6-digit verification code
        setStage('verify');
        setResendCooldown(60);
        setSuccessMessage(`Mã xác thực 6 chữ số đã được gửi đến ${email.trim()}. Vui lòng kiểm tra hộp thư!`);
      } else if (data?.user) {
        // Direct signup without email verification requirement
        await syncUserWithDb(data.user);
        await refreshUser();
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setErrorMessage(err.message || 'Đã có lỗi xảy ra trong quá trình đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMessage('Vui lòng nhập đúng mã xác thực 6 chữ số.');
      return;
    }

    try {
      setIsVerifying(true);
      const { data, error } = await insforge.auth.verifyEmail({
        email: email.trim(),
        otp: cleanOtp,
      });

      if (error) {
        setErrorMessage(error.message || 'Mã xác thực không chính xác hoặc đã hết hạn.');
        return;
      }

      if (data?.user) {
        // Successfully verified and signed in!
        await syncUserWithDb(data.user);
        await refreshUser();
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setErrorMessage(err.message || 'Xác thực OTP thất bại.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setErrorMessage(null);

    try {
      setIsResending(true);
      const origin = window.location.origin;
      const { error } = await insforge.auth.resendVerificationEmail({
        email: email.trim(),
        redirectTo: `${origin}/auth/callback`,
      });

      if (error) {
        setErrorMessage(error.message || 'Không thể gửi lại mã xác thực.');
      } else {
        setResendCooldown(60);
        setSuccessMessage('Đã gửi lại mã xác thực mới đến email của bạn.');
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      setErrorMessage(err.message || 'Lỗi khi gửi lại mã.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    try {
      setIsGoogleLoading(true);
      const origin = window.location.origin;
      await insforge.auth.signInWithOAuth('google', {
        redirectTo: `${origin}/auth/callback`,
        additionalParams: { prompt: 'select_account' },
      });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMessage(err.message || 'Không thể kết nối đến dịch vụ Google.');
      setIsGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      {/* Background glowing effects */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />

      <Card className="relative z-10 w-full max-w-md border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            {stage === 'verify' ? 'Xác thực Email' : 'Tạo tài khoản mới'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {stage === 'verify'
              ? `Nhập mã 6 chữ số gửi đến ${email}`
              : 'Tham gia Social Media AI Agent chỉ trong vài giây'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {stage === 'form' ? (
            <>
              {/* Google / Gmail Sign In Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700 hover:text-white"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="mr-2.5" />
                )}
                Đăng ký với Google / Gmail
              </Button>

              <div className="relative flex items-center justify-center py-2">
                <div className="w-full border-t border-slate-800" />
                <span className="absolute bg-slate-900 px-3 text-xs text-slate-400 uppercase tracking-wider">
                  hoặc đăng ký bằng Email
                </span>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-slate-300">
                    Họ và tên
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 pl-9 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-slate-300">
                    Địa chỉ Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 pl-9 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-slate-300">
                    Mật khẩu (tối thiểu 6 ký tự)
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Tối thiểu 6 ký tự..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 pl-9 pr-9 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-300">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-10 pl-9 border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 mt-2 font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đăng ký...
                    </>
                  ) : (
                    <>
                      Đăng ký tài khoản
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* OTP Verification Stage */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-xs font-medium text-slate-300">
                  Mã xác thực 6 chữ số
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="h-12 pl-9 text-center text-xl font-mono tracking-widest border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                disabled={isVerifying || otpCode.trim().length < 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xác thực...
                  </>
                ) : (
                  <>
                    Xác nhận mã OTP & Đăng nhập
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStage('form')}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  ← Đổi email khác
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending}
                  className="flex items-center gap-1 font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
                </button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-center border-t border-slate-800/60 pt-4">
          <p className="text-center text-xs text-slate-400">
            Đã có tài khoản?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-indigo-400 transition hover:text-indigo-300 underline underline-offset-4"
            >
              Đăng nhập tại đây
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
