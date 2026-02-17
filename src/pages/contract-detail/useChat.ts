import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChatMessages, sendChatMessage } from "@/near/social";
import type { SocialMessage } from "@/near/social";
import { useWallet } from "@/hooks/useWallet";
import { useRef, useMemo } from "react";

export function useChat(contractId: string | undefined, participants: string[] = []) {
  const { accountId } = useWallet();
  const queryClient = useQueryClient();
  const pendingMessages = useRef<SocialMessage[]>([]);

  const query = useQuery({
    queryKey: ["chat", contractId],
    queryFn: () => getChatMessages(contractId!, participants),
    enabled: !!contractId && participants.length > 0,
    refetchInterval: 3_000,
  });

  const fetched = query.data || [];

  const messages = useMemo(() => {
    if (pendingMessages.current.length === 0) return fetched;
    const fetchedTimestamps = new Set(fetched.map((m) => m.timestamp));
    const stillPending = pendingMessages.current.filter(
      (pm) => !fetchedTimestamps.has(pm.timestamp),
    );
    pendingMessages.current = stillPending;
    return [...fetched, ...stillPending];
  }, [fetched]);

  const sendMessage = useMutation({
    mutationFn: (content: string) => {
      if (!accountId || !contractId) throw new Error("Not connected");
      return sendChatMessage(accountId, contractId, content);
    },
    onMutate: (content: string) => {
      const msg: SocialMessage = {
        id: `pending-${Date.now()}`,
        sender: accountId!,
        content,
        timestamp: Date.now(),
        type: "text",
      };
      pendingMessages.current = [...pendingMessages.current, msg];
      queryClient.invalidateQueries({ queryKey: ["chat", contractId] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", contractId] });
    },
  });

  return {
    messages: { ...query, data: messages },
    sendMessage,
  };
}
