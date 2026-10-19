'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  LogOut,
  User,
  ShieldCheck,
  Database,
  Calendar,
  Sparkles,
  Bot,
  Share2,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, dbUser, loading, signOut } = useAuth();

  // Route protection: only authenticated users can access /dashboard
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/sign-in');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="mt-4 text-sm text-slate-400">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  const displayName = user.name || user.profile?.name || user.email?.split('@')[0] || 'Người dùng';
  const avatarUrl = user.profile?.avatar_url || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                Social Media AI Agent
              </h1>
              <span className="text-xs text-indigo-400">InsForge Backend Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{user.email}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/60 p-6 sm:p-8">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                Đăng nhập thành công
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Xin chào, {displayName}! 👋
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl">
                Bạn đã được xác thực an toàn qua InsForge Auth. Mọi tác vụ quản lý bài đăng mạng xã hội và tác vụ AI đều sẵn sàng hoạt động.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-16 w-16 rounded-full border-2 border-indigo-500 object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-indigo-500/40 bg-indigo-600/30 text-indigo-300 shadow-lg text-xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Information & Database Sync Status Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* InsForge Auth Details */}
          <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
            <CardHeader className="border-b border-slate-800/60 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  Thông tin xác thực (InsForge Auth)
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Đã xác thực
                </Badge>
              </div>
              <CardDescription className="text-slate-400">
                Tài khoản được bảo vệ bởi cơ chế bảo mật của InsForge
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-3.5 text-sm">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-200">{user.email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Họ tên:</span>
                <span className="text-slate-200">{displayName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">InsForge Auth ID:</span>
                <span className="font-mono text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                  {user.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hình thức đăng nhập:</span>
                <span className="text-slate-200">
                  {user.email?.endsWith('@gmail.com') ? 'Google / Email' : 'Email & Mật khẩu'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Database Synced User Details */}
          <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
            <CardHeader className="border-b border-slate-800/60 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
                  <Database className="h-5 w-5 text-emerald-400" />
                  Dữ liệu đồng bộ PostgreSQL
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Đã lưu vào DB
                </Badge>
              </div>
              <CardDescription className="text-slate-400">
                Tự động lưu thông tin người dùng vào bảng `users` khi đăng ký / đăng nhập
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-3.5 text-sm">
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Bảng cơ sở dữ liệu:</span>
                <span className="font-mono text-emerald-300">users (PostgreSQL)</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Database ID (Serial PK):</span>
                <span className="font-mono text-slate-200">
                  {dbUser?.id ? `#${dbUser.id}` : 'Đã đồng bộ'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-2.5">
                <span className="text-slate-400">Trạng thái lưu trữ:</span>
                <span className="inline-flex items-center text-xs text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Đồng bộ tức thời (First time sync)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Thời gian tạo:</span>
                <span className="text-slate-200">
                  {dbUser?.createdAt ? new Date(dbUser.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards / Overview */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Các tính năng chính của hệ thống</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition cursor-pointer">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-base text-white">Tạo nội dung AI</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Tự động soạn bài viết, kịch bản video và hình ảnh bằng AI đa mô hình.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition cursor-pointer">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                  <Share2 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base text-white">Đa nền tảng mạng xã hội</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Kết nối Facebook, X (Twitter), LinkedIn, Instagram để đăng bài tự động.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 transition cursor-pointer">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <CardTitle className="text-base text-white">Phân tích & Tối ưu</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Theo dõi lượt tương tác, thời điểm vàng đăng bài và báo cáo hiệu quả.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
