import { ChatMessage } from "@/types/contract";

export const formatMessageDate = (timestamp: string): string => {
  const msgDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  msgDate.setHours(0, 0, 0, 0);

  if (msgDate.getTime() === today.getTime()) {
    return "Today";
  }
  if (msgDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  return msgDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatMessageTime = (timestamp: string): string => {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
};

export const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export interface MessageGroup {
  type: "date" | "message";
  date?: string;
  message?: ChatMessage;
}

export const groupMessagesByDate = (messages: ChatMessage[]): MessageGroup[] => {
  if (messages.length === 0) return [];

  const grouped: MessageGroup[] = [];
  let currentDate: Date | null = null;

  messages.forEach((msg) => {
    const msgDate = new Date(msg.timestamp);
    msgDate.setHours(0, 0, 0, 0);

    if (!currentDate || !isSameDate(currentDate, msgDate)) {
      grouped.push({
        type: "date",
        date: formatMessageDate(msg.timestamp),
      });
      currentDate = msgDate;
    }

    grouped.push({
      type: "message",
      message: msg,
    });
  });

  return grouped;
};
