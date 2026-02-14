import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChatMessages, sendChatMessage } from "@/near/social";
import { useWallet } from "./useWallet";

export function useChat(contractId: string | undefined) {
  const { accountId } = useWallet();
  const queryClient = useQueryClient();

  const messages = useQuery({
    queryKey: ["chat", contractId],
    queryFn: () => getChatMessages(contractId!),
    enabled: !!contractId,
    refetchInterval: 5_000,
  });

  const sendMessage = useMutation({
    mutationFn: (content: string) => {
      if (!accountId || !contractId) throw new Error("Not connected");
      return sendChatMessage(accountId, contractId, content);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chat", contractId] }),
  });

  return { messages, sendMessage };
}
