import type { Note } from '$lib/types/index.js';

export function generateNoteTitle(content: string, createdAt: Date): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return `Untitled - ${formatDate(createdAt)}`;
  }

  const firstLine = trimmed.split('\n')[0] ?? '';
  const truncated = firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;

  return truncated || `Untitled - ${formatDate(createdAt)}`;
}

export function formatDate(date: Date): string {
  const now = new Date();
  const noteDate = new Date(date);
  const isToday = now.toDateString() === noteDate.toDateString();
  const isYesterday =
    new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === noteDate.toDateString();

  if (isToday) {
    return `Today ${noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (isYesterday) {
    return `Yesterday ${noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return noteDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export function isNoteEmpty(content: string): boolean {
  return content.trim() === '';
}

export function generateNoteId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11);
}

export function sortNotesByDate(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
