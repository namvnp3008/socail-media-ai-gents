'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sparkles, Bot, ArrowRight, ShieldCheck, Database, Zap, Share2 } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Bot className="h-6 w-6" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Social Media AI Agent
            </span>
          </div>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-800" />
            ) : user ? (
              <Link href="/dashboard">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30">
                  Vào Dashboard
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/60">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30">
                    Đăng ký miễn phí
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Tích hợp InsForge Authentication & Postgres Database
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
          Quản lý mạng xã hội tự động hoá với{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            AI Agent thông minh
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
          Lên kế hoạch, tạo nội dung viral, đăng bài đa kênh và đo lường tương tác trên các nền tảng mạng xã hội hoàn toàn tự động.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-6 text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/30">
                Truy cập Dashboard của bạn
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-6 text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/30">
                  Bắt đầu ngay hôm nay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white">
                  Đăng nhập tài khoản
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">InsForge Auth</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Hỗ trợ xác thực bằng tài khoản Google / Gmail và Email + Mật khẩu an toàn với xác minh OTP.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30 mb-4">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Đồng bộ PostgreSQL</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Tự động lưu thông tin tài khoản người dùng vào bảng users trong cơ sở dữ liệu ngay lần đăng nhập đầu tiên.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 ring-1 ring-purple-500/30 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-white">Next.js 16 & Drizzle ORM</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Kiến trúc hiện đại, hiệu năng tối đa và kết nối trực tiếp đến backend InsForge BaaS.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
