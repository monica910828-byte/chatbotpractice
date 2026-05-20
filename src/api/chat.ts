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

export const sendMessageStream = async (
  messages: Message[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (_) {
        errorMessage = `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder('utf-8');
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: !done });
        onChunk(chunk);
      }
    }
  } catch (error) {
    console.error('Error in sendMessageStream:', error);
    throw error;
  }
};
