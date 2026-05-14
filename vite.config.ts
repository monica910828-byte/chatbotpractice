import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load .env.local manually for the config
dotenv.config({ path: '.env.local' })

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/chat' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });

              req.on('end', async () => {
                try {
                  const { messages } = JSON.parse(body);
                  const openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY || env.OPENAI_API_KEY,
                  });

                  const response = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                      {
                        role: 'system',
                        content: `
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
`
                      },
                      ...messages,
                    ],
                  });

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ reply: response.choices[0].message.content }));
                } catch (error: any) {
                  console.error('API Middleware Error:', error);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Internal Error', message: error.message }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
  }
})
