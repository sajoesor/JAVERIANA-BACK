import Conversation from '../models/Conversation.js';

const CONVERSATION_TIMEOUT_MINUTES = 5;

export async function autoCloseInactiveConversations() {
  const timeoutDate = new Date(Date.now() - CONVERSATION_TIMEOUT_MINUTES * 60 * 1000);

  const result = await Conversation.updateMany(
    {
      status: "active",
      lastInteraction: { $lt: timeoutDate }
    },
    {
      $set: {
        status: "completed",
        completedAt: new Date()
      }
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`✅ Conversaciones cerradas automáticamente: ${result.modifiedCount}`);
  }
}
