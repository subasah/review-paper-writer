import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function formatAuthorYear(authors: string[], year: number): string {
  const first = authors[0]?.split(' ').pop() ?? 'Unknown'
  return `[${first}, ${year}]`
}
