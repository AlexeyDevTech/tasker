'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';

// Возвращает true, если фокус сейчас в поле ввода — тогда одиночные
// буквенные шорткаты глушим, чтобы не мешать набору текста.
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

/**
 * Глобальные горячие клавиши приложения (speed-first).
 * Монтируется один раз (через CommandPalette, который есть на всех экранах).
 *
 *  C            — открыть быстрое создание задачи
 *  ⌘/Ctrl + N   — новый проект
 *  ⌘/Ctrl + K   — командное меню (обрабатывается в CommandPalette)
 *  G затем H    — на дашборд
 */
export function useGlobalHotkeys() {
  const router = useRouter();
  const { setCreateTaskModalOpen, setCreateProjectModalOpen, commandPaletteOpen } = useUIStore();

  useEffect(() => {
    let lastG = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      // Не перехватываем во время набора текста или когда открыта палитра.
      if (isTypingTarget(e.target) || commandPaletteOpen) return;

      const mod = e.metaKey || e.ctrlKey;

      // ⌘/Ctrl + N — новый проект (перебиваем стандартное «новое окно»).
      if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setCreateProjectModalOpen(true);
        return;
      }

      if (mod) return; // прочие комбинации с модификатором не наши

      // Одиночные клавиши
      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault();
          setCreateTaskModalOpen(true);
          break;
        case 'g':
          lastG = Date.now();
          break;
        case 'h':
          // G, затем H в течение 600 мс — переход на дашборд
          if (Date.now() - lastG < 600) {
            e.preventDefault();
            router.push('/');
          }
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [router, setCreateTaskModalOpen, setCreateProjectModalOpen, commandPaletteOpen]);
}
