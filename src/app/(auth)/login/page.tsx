'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Неверный email или пароль');
      } else {
        toast.success('Добро пожаловать!');
        router.push('/');
      }
    } catch (error) {
      toast.error('Ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const handleGithubLogin = () => {
    signIn('github', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-foreground">TaskFlow</span>
              <span className="text-[10px] text-muted-foreground font-medium -mt-0.5">Project Manager</span>
            </div>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl font-semibold tracking-tight">Добро пожаловать</CardTitle>
              <CardDescription>
                Войдите в аккаунт или создайте новый
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleGoogleLogin} 
                  disabled={isLoading}
                  className="h-10 border-border hover:bg-accent"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleGithubLogin} 
                  disabled={isLoading}
                  className="h-10 border-border hover:bg-accent"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium">или</span>
                </div>
              </div>

              {/* Email Login */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-10 border-border focus:border-primary/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-10 border-border focus:border-primary/50 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" className="rounded border-border/60 h-4 w-4 accent-primary" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Запомнить меня</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    <>
                      Войти
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

            </CardContent>
            <CardFooter className="justify-center pt-2">
              <p className="text-sm text-muted-foreground">
                Нет аккаунта?{' '}
                <Link href="/register" className="text-primary font-semibold hover:underline underline-offset-4">
                  Зарегистрироваться
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <h2 className="text-3xl font-semibold mb-3 leading-tight tracking-tight">
            Планируйте проекты умнее и быстрее
          </h2>
          <p className="text-primary-foreground/70 mb-8">
            Доски, таймлайн и календарь — всё в одном месте.
          </p>

          <div className="space-y-2">
            {[
              { icon: LayoutDashboard, title: 'Канбан-доска', desc: 'Drag & drop планирование задач' },
              { icon: Calendar, title: 'Таймлайн и календарь', desc: 'Сроки и зависимости наглядно' },
              { icon: CheckCircle2, title: 'Готовые шаблоны', desc: 'Быстрый старт новых проектов' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/15">
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-primary-foreground/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
