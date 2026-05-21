'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface AvatarUploadProps {
  userImage?: string;
  userName?: string;
  onAvatarChange?: () => void; // Placeholder for actual change logic
}

export function AvatarUpload({ userImage, userName, onAvatarChange }: AvatarUploadProps) {
  const fallbackChar = userName?.[0]?.toUpperCase() || 'D';

  return (
    <div className="flex items-center gap-6">
      <Avatar className="h-20 w-20">
        <AvatarImage src={userImage || undefined} />
        <AvatarFallback className="text-2xl">
          {fallbackChar}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <Button variant="outline" onClick={onAvatarChange}>Изменить аватар</Button>
        <p className="text-xs text-muted-foreground">
          JPG, PNG или GIF. Максимум 2MB.
        </p>
      </div>
    </div>
  );
}
