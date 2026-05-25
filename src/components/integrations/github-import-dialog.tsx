'use client';

// Диалог импорта открытых GitHub-issues в проект. Токен (PAT) отправляется
// на сервер только для одного запроса и нигде не сохраняется.
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface GithubImportDialogProps {
  projectId: string;
}

export function GithubImportDialog({ projectId }: GithubImportDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [repo, setRepo] = useState('');
  const [token, setToken] = useState('');

  const importMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/integrations/github/import-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, repo: repo.trim(), token: token.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось импортировать');
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success(`Импортировано: ${data.created}, пропущено: ${data.skipped}`);
      setOpen(false);
      setToken('');
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" title="Импорт issues из GitHub">
          <Github className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Импорт issues из GitHub
          </DialogTitle>
          <DialogDescription>
            Открытые issues репозитория будут добавлены как задачи со связями. Уже импортированные пропускаются.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="gh-repo">Репозиторий</Label>
            <Input
              id="gh-repo"
              placeholder="owner/repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gh-token">Personal access token <span className="text-muted-foreground">(для приватных репо)</span></Label>
            <Input
              id="gh-token"
              type="password"
              placeholder="ghp_…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">Используется только для этого запроса и не сохраняется.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button
            onClick={() => importMutation.mutate()}
            disabled={!/^[\w.-]+\/[\w.-]+$/.test(repo.trim()) || importMutation.isPending}
            className="gap-2"
          >
            {importMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Импортировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
