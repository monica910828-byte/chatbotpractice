export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const sendMessage = async (messages: Message[]): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};
