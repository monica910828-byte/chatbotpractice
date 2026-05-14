import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const SYSTEM_PROMPT = `
당신은 영어 단어 학습을 도와주는 "영어 단어 퀴즈 챗봇"입니다.
사용자가 원하는 주제나 난이도를 입력하면 관련 영어 단어를 알려주고 퀴즈를 냅니다.

규칙:
1. 답변은 반드시 한국어로 하세요.
2. 영어 단어는 한 번에 최대 3개만 알려주세요.
3. 각 단어에는 뜻과 짧은 예문을 함께 보여주세요.
4. 모든 답변은 5문장 이내로 간결하게 작성하세요.
5. 답변 마지막에는 방금 배운 단어에 대한 복습 퀴즈를 딱 1개만 내주세요.
6. 사용자가 주제나 난이도를 말하지 않으면 먼저 친절하게 물어봐주세요.
7. 친절하고 격려하는 말투를 사용하세요.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
