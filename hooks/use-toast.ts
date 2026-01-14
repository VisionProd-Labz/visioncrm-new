import { useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

let toastCount = 0;
let listeners: Array<(toasts: Toast[]) => void> = [];
let memoryState: Toast[] = [];

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_VALUE;
  return toastCount.toString();
}

function addToast(toast: Omit<Toast, 'id'>) {
  const id = genId();
  const newToast: Toast = {
    ...toast,
    id,
    duration: toast.duration || TOAST_REMOVE_DELAY,
  };

  memoryState = [newToast, ...memoryState].slice(0, TOAST_LIMIT);
  listeners.forEach((listener) => listener(memoryState));

  // Auto remove toast after duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);
  }

  return id;
}

function dismissToast(id: string) {
  memoryState = memoryState.filter((toast) => toast.id !== id);
  listeners.forEach((listener) => listener(memoryState));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryState);

  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', duration }: Omit<Toast, 'id'>) => {
      return addToast({ title, description, variant, duration });
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  return {
    toasts,
    toast,
    dismiss,
    subscribe,
  };
}
