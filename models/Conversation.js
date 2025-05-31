import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  status: { type: String, enum: ['active', 'timeout', 'completed'], default: 'active' },
  lastInteraction: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Método para verificar inactividad
conversationSchema.methods.checkInactivity = function() {
  const now = new Date();
  const diffMinutes = (now - this.lastInteraction) / (1000 * 60);
  
  if (diffMinutes > 3 && this.status === 'active') {
    this.status = 'timeout';
    return 'timeout';
  } else if (diffMinutes > 1.5 && this.status === 'active') {
    return 'check1';
  } else if (diffMinutes > 2 && this.status === 'active') {
    return 'check2';
  }
  return null;
};

export default mongoose.model('Conversation', conversationSchema);

