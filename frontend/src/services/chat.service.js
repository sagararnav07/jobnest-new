import api, { unwrap } from "../lib/api";

export const sendMessage = async ({ receiverEmail, message }) => {
  const data = await unwrap(api.post("/chat/messages", { receiverEmail, message }));
  return data.message;
};

export const getConversation = async (participantEmail) => {
  const data = await unwrap(api.get(`/chat/conversations/${participantEmail}`));
  return data.messages;
};

export const getConversations = async () => {
  const data = await unwrap(api.get("/chat/conversations"));
  return data.conversations;
};
