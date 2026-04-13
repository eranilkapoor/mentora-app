export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  icon: string;
  iconColor?: string;
}

export interface NotifSection {
  title: string;
  icon: string;
  data: Notification[];
}
