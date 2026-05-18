// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Declare Deno to prevent TypeScript errors in the Next.js environment
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { wrongAnswers, userId, promptType, sentenceData, customPrompt } = await req.json()

    // 从环境变量中获取 Token 和 Bot ID（如果没有设置，则使用提供的默认值）
    // 注意：改用 COZE_API_TOKEN_V2 避免读取到旧的无效密钥
    const COZE_API_TOKEN = Deno.env.get('COZE_API_TOKEN_V2') || 'pat_LQdudGnsForEe9hATk8xLuOF9RpYIo5onZ0qDPwvqabM0oJGEmmqyWQcUa9vuEqU';
    const COZE_BOT_ID = Deno.env.get('COZE_BOT_ID') || '7633406989321895951';
    
    let promptText = "";

    if (promptType === 'sentence_explain') {
      if (!sentenceData) {
        return new Response(JSON.stringify({ error: 'No sentence data provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      promptText = `
请你作为专业的四级英语老师，为学生讲解下面这句话。
英文句子：${sentenceData.expected}
中文翻译：${sentenceData.translation}
${sentenceData.actual ? `学生的作答：${sentenceData.actual}` : ''}

要求：
1. 简要分析这句话的语法结构和核心词汇。
2. ${sentenceData.actual ? '指出学生作答中的错误并给出纠正。' : '给出学习建议。'}
3. 语气要像一位耐心、鼓励学生的AI外教。
4. 用精简的语言，不超过150字，排版清晰。
`;
    } else if (promptType === 'teacher_learning_analysis') {
      promptText = `
请你作为资深的四级英语教研专家，为当前班级/年级生成一份【全局学情分析报告】。
以下是该范围内的练习数据聚合（包含学生总数、各模块平均分、以及最近模考中的高频错句）：
${JSON.stringify(sentenceData, null, 2)}

要求：
1. 语气专业、客观，具有宏观指导性（以教研专家对授课老师或教研团队的口吻，例如：“从本周的数据来看，学生整体在...”）。
2. 从“听力（模考平均分与高频错题）”和“词汇”两个维度，指出该群体目前普遍存在的共性薄弱点。
3. 根据高频错题的具体文本，推测出学生共同的听音盲区（如特定单词不认识、连读弱读未掌握、或者长难句切分能力弱），并给出针对整个班级的下一步教学重点或复习建议。
4. 语言精炼，排版美观（使用 Markdown 列表和粗体），控制在 350 字以内。
`;
    } else if (promptType === 'custom' && customPrompt) {
      promptText = customPrompt;
    } else {
      // 检查是否有错题
      if (!wrongAnswers || wrongAnswers.length === 0) {
        return new Response(JSON.stringify({ error: 'No wrong answers provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // 构造请求给大模型的 Prompt
      promptText = `
请你作为专业的四级英语老师，为学生进行错因分析。
以下是学生在最近一次听力测试中的错题记录：
${JSON.stringify(wrongAnswers, null, 2)}

要求：
1. 请从“词汇”、“语法”、“听音辨音”等维度进行总结。
2. 用精简的语言，不超过150字。
3. 直接给出最核心的提分建议，不要说废话。
`;
    }

    // 调用 Coze V3 API
    const response = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: COZE_BOT_ID,
        user_id: userId || `cet4_student_${Date.now()}`,
        stream: true,
        auto_save_history: false,
        additional_messages: [
          {
            role: "user",
            content: promptText,
            content_type: "text"
          }
        ]
      })
    });

    // 检查 Coze 是否返回了非流式的 JSON 错误
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorJson = await response.json();
      console.error("Coze API returned JSON error:", errorJson);
      return new Response(JSON.stringify({ 
        error: errorJson.msg || 'Coze API Error',
        details: errorJson 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Coze API error:", errorText);
      return new Response(JSON.stringify({ error: 'Failed to fetch from Coze API' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 将大模型的流式响应直接透传给前端
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
