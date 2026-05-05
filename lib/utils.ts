import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function getTimeRemaining(deadline: string) {
  const total = new Date(deadline).getTime() - Date.now();
  return { total, days: Math.max(0,Math.floor(total/(1000*60*60*24))), hours: Math.max(0,Math.floor((total/(1000*60*60))%24)), minutes: Math.max(0,Math.floor((total/1000/60)%60)), seconds: Math.max(0,Math.floor((total/1000)%60)) };
}
