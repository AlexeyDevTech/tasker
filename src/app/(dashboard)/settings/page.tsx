'use client';

import { useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
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
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

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

function SettingsContent() {
  const { sidebarOpen } = useProjectStore();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  const user = {
    id: 'demo',
    name: 'Demo User',
    email: 'demo@taskflow.app',
    image: null,
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar projects={projects} />
      
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-0'
      )}>
        <Header user={user} />
        
        <main className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
                <SettingsIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Настройки</h1>
                <p className="text-muted-foreground text-sm">
                  Управление аккаунтом и предпочтениями
                </p>
              </div>
            </div>
          </div>

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
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="text-2xl">
                          {user.name?.[0]?.toUpperCase() || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button variant="outline">Изменить аватар</Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG или GIF. Максимум 2MB.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Form */}
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Имя</Label>
                          <Input id="name" defaultValue={user.name || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" defaultValue={user.email} disabled />
                          <Badge variant="secondary" className="text-xs">
                            Основной email
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Часовой пояс</Label>
                        <Select defaultValue="utc">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utc">UTC (Москва: UTC+3)</SelectItem>
                            <SelectItem value="eet">EET (Киев: UTC+2)</SelectItem>
                            <SelectItem value="pst">PST (Лос-Анджелес: UTC-8)</SelectItem>
                            <SelectItem value="est">EST (Нью-Йорк: UTC-5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="worktime">Предпочитаемое время работы</Label>
                        <Select defaultValue="morning">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="morning">🌅 Утро (6:00 - 12:00)</SelectItem>
                            <SelectItem value="afternoon">☀️ День (12:00 - 18:00)</SelectItem>
                            <SelectItem value="evening">🌙 Вечер (18:00 - 00:00)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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
