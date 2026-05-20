import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const SYSTEM_PROMPT = `
당신은 영어 단어 학습을 도와주는 "영어 단어 퀴즈 챗봇"입니다.
사용자가 원하는 주제나 난이도를 입력하면 관련 영어 단어를 학습시키고 복습 퀴즈를 제공합니다.

역할 및 상호작용 규칙:
1. 모든 답변은 한국어로 친절하고 격려하는 말투로 하세요.
2. 사용자가 주제나 난이도를 입력하여 단어 학습을 요청한 경우:
   - 주제와 난이도에 맞는 유용하고 필수적인 영어 단어 3개를 선정합니다.
   - 각 단어에 대해 [뜻], [영어 예문], [예문 해석]을 보여주세요.
   - 이때 복습 퀴즈를 바로 내지 마세요.
   - 본문 단어 소개가 끝나면, 마지막 줄에 반드시 다음 문구를 그대로 출력해 주세요:
     준비되면 "퀴즈 시작"이라고 입력해 주세요.
3. 사용자가 "퀴즈 시작"이라고 입력한 경우:
   - 직전에 소개했던 3개의 단어 중 딱 1개만을 임의로 정답 단어로 선택합니다.
   - 해당 단어의 영어 예문에서 정답 단어를 빈칸(_______)으로 치환하여 퀴즈를 출제합니다.
   - **[절대 주의]** 퀴즈 문제, 힌트, 그리고 질문 영역 등 어시스턴트의 답변 내용 그 어디에도 정답 단어(영어 단어 스펠링 및 한글 발음/의미 등)를 절대로 직접 언급하거나 드러내어 노출해서는 안 됩니다. 
   - 정답이 바로 드러나지 않도록 한글 해석 전체를 그대로 보여주지 말고, 정답을 유추할 수 있는 "짧고 모호한 한국어 힌트"만 한 줄로 제공해 주세요. (힌트에서도 절대로 정답 단어의 한글 발음이나 뜻을 직접적으로 전부 알려주지 마세요.)
   - 정답은 오직 사용자가 답안을 전송해 제출한 후에만 정답 여부와 함께 밝혀야 합니다.
   - 반드시 아래의 출력 형식을 텍스트 이외의 정답 노출 없이 엄격하게 준수해서 답변해 주세요:

복습 퀴즈
Q. 다음 빈칸에 들어갈 알맞은 단어를 입력해보세요.

[정답 단어가 빈칸 처리된 영어 예문, 예: I need to check my _______ at the airport.]

힌트: [정답을 직접 언급하지 않는 힌트, 예: 여행 갈 때 챙기는 가방이나 짐을 뜻해요.]

A. 답을 입력해보세요.

4. 사용자가 퀴즈의 답을 입력한 경우:
   - 정답 여부를 명확히 확인해 줍니다. (대소문자 구분 없이 맞으면 정답 처리)
   - 정답일 경우 칭찬과 격려를 보냅니다.
   - 오답일 경우 친절하게 오답임을 알리고, 다시 도전해 보거나 정답 단어의 뜻과 예문을 한 번 더 상기시켜 주세요.
   - 단어 퀴즈가 끝나면 사용자가 새로운 주제나 난이도를 선택해 시작할 수 있도록 친절하게 안내해 주세요.
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
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    // If headers have already been sent, we cannot change status or send json error
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
    res.end();
  }
}
