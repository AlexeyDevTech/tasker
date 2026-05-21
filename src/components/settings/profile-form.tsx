'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProfileFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  timezone: string;
  setTimezone: (timezone: string) => void;
  workTime: string;
  setWorkTime: (workTime: string) => void;
}

export function ProfileForm({
  name,
  setName,
  email,
  timezone,
  setTimezone,
  workTime,
  setWorkTime,
}: ProfileFormProps) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Имя</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} disabled />
          <Badge variant="secondary" className="text-xs">
            Основной email
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Часовой пояс</Label>
        <Select value={timezone} onValueChange={setTimezone}>
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
        <Select value={workTime} onValueChange={setWorkTime}>
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
  );
}
