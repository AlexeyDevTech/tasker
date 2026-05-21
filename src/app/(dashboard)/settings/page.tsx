'use client';

import { useState, useEffect } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/common/page-header';
import { AvatarUpload } from '@/components/settings/avatar-upload';
import { ProfileForm } from '@/components/settings/profile-form';
import { CommandPalette } from '@/components/layout/command-palette';
import { useProjectStore } from '@/stores/project-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Fetch projects
async function fetchProjects() {
  const res = await fetch('/api/projects');
  const data = await res.json();
  return data.data || [];
}

// Fetch the current user's profile (timezone / work time live in the DB,
// not in the next-auth session).
async function fetchProfile() {
  const res = await fetch('/api/user/settings');
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

function SettingsContent() {
  const { sidebarOpen } = useProjectStore();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: !!user,
  });

  // Form state
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('utc');
  const [workTime, setWorkTime] = useState('morning');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTimezone(profile.timezone || 'utc');
      setWorkTime(profile.preferredWorkTime || 'morning');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          timezone,
          preferredWorkTime: workTime,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      // Update the session to reflect the changes immediately
      await updateSession({
        ...session,
        user: {
          ...user,
          name,
          timezone,
          preferredWorkTime: workTime,
        },
      });

      toast.success('Настройки успешно сохранены!');

    } catch (error) {
      toast.error('Ошибка при сохранении настроек.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    // Or a loading spinner
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar projects={projects} />
      
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'ml-60' : 'ml-0'
      )}>
        <Header user={user} />
        
        <main className="p-6">
          <PageHeader
            icon={<SettingsIcon className="h-4 w-4" />}
            title="Настройки"
            description="Управление аккаунтом и предпочтениями"
          />

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Профиль
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />
                Оформление
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Уведомления
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Безопасность
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Профиль пользователя</CardTitle>
                    <CardDescription>
                      Основная информация о вашем аккаунте
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <AvatarUpload
                      userImage={user.image || undefined}
                      userName={user.name || ''}
                      onAvatarChange={() => toast.info('Изменение аватара в разработке')}
                    />

                    <Separator />

                    <ProfileForm
                      name={name}
                      setName={setName}
                      email={user.email || ''}
                      timezone={timezone}
                      setTimezone={setTimezone}
                      workTime={workTime}
                      setWorkTime={setWorkTime}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Оформление</CardTitle>
                  <CardDescription>
                    Настройте внешний вид приложения
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme */}
                  <div className="space-y-4">
                    <Label>Тема оформления</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                          theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Sun className="h-6 w-6" />
                        <span className="text-sm font-medium">Светлая</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                          theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Moon className="h-6 w-6" />
                        <span className="text-sm font-medium">Тёмная</span>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                          theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        )}
                      >
                        <Monitor className="h-6 w-6" />
                        <span className="text-sm font-medium">Системная</span>
                      </button>
                    </div>
                  </div>

                  <Separator />

                  {/* Sidebar */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Компактный сайдбар</Label>
                      <p className="text-sm text-muted-foreground">
                        Уменьшить ширину боковой панели
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Показывать иконки проектов</Label>
                      <p className="text-sm text-muted-foreground">
                        Отображать emoji-иконки в списке проектов
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Уведомления</CardTitle>
                  <CardDescription>
                    Настройте способы получения уведомлений
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email-уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Получать уведомления на почту
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push-уведомления</Label>
                      <p className="text-sm text-muted-foreground">
                        Получать уведомления в браузере
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Напоминания о дедлайнах</Label>
                      <p className="text-sm text-muted-foreground">
                        Напоминать о приближении сроков задач
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Уведомления о комментариях</Label>
                      <p className="text-sm text-muted-foreground">
                        Уведомлять о новых комментариях в задачах
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Еженедельный дайджест</Label>
                      <p className="text-sm text-muted-foreground">
                        Получать еженедельную сводку по проектам
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Пароль</CardTitle>
                    <CardDescription>
                      Изменение пароля аккаунта
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current">Текущий пароль</Label>
                      <Input id="current" type="password" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new">Новый пароль</Label>
                        <Input id="new" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Подтвердите пароль</Label>
                        <Input id="confirm" type="password" />
                      </div>
                    </div>
                    <Button>Изменить пароль</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Двухфакторная аутентификация</CardTitle>
                    <CardDescription>
                      Добавьте дополнительный уровень защиты
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">2FA отключена</p>
                        <p className="text-sm text-muted-foreground">
                          Защитите свой аккаунт с помощью двухфакторной аутентификации
                        </p>
                      </div>
                      <Button variant="outline">Включить 2FA</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Опасная зона</CardTitle>
                    <CardDescription>
                      Необратимые действия с аккаунтом
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-medium">Удалить аккаунт</p>
                        <p className="text-sm text-muted-foreground">
                          Безвозвратно удалить ваш аккаунт и все данные
                        </p>
                      </div>
                      <Button variant="destructive">Удалить аккаунт</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Save button */}
          <div className="fixed bottom-6 right-6">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </main>
      </div>

      <CommandPalette projects={projects} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsContent />
    </QueryClientProvider>
  );
}
