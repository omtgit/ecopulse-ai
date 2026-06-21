import { create } from "zustand";

/**
 * Notification item for the toast/notification system.
 */
interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

/**
 * State shape for the UI store.
 */
interface UIState {
  /** Whether the sidebar is open (mobile) */
  sidebarOpen: boolean;
  /** Current theme (system, light, dark) */
  theme: "system" | "light" | "dark";
  /** Active notification queue */
  notifications: Notification[];
}

/**
 * Actions available on the UI store.
 */
interface UIActions {
  /** Toggle sidebar open/closed */
  toggleSidebar: () => void;
  /** Set sidebar state explicitly */
  setSidebarOpen: (open: boolean) => void;
  /** Set theme */
  setTheme: (theme: "system" | "light" | "dark") => void;
  /** Add a notification to the queue */
  addNotification: (
    notification: Omit<Notification, "id">
  ) => void;
  /** Remove a notification by ID */
  removeNotification: (id: string) => void;
  /** Clear all notifications */
  clearNotifications: () => void;
}

let notificationCounter = 0;

/**
 * Zustand store for global UI state.
 * Manages sidebar visibility, theme selection, and the notification queue.
 */
export const useUIStore = create<UIState & UIActions>((set) => ({
  // Initial state
  sidebarOpen: false,
  theme: "system",
  notifications: [],

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setTheme: (theme) => set({ theme }),

  addNotification: (notification) => {
    const id = `notif-${++notificationCounter}-${Date.now()}`;
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));
