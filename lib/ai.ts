type CopyRequest = {
  prompt: string;
};

type ImageRequest = {
  prompt: string;
};

type VideoRequest = {
  duration?: number;
  imageUrl?: string;
  prompt: string;
};

type VideoStatusResponse = {
  request_id?: string;
  status?: string;
  video?: {
    url?: string;
  };
  error?: {
    message?: string;
  };
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`缺少环境变量 ${name}。`);
  }

  return value;
}

export async function generateCopyReply({ prompt }: CopyRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return [
      "这是演示模式下的 AI 回复。",
      `你刚才的问题是：${prompt}`,
      "正式上线后，把 DeepSeek 的 Key 配好，这里就会返回真实文案结果。",
    ].join("\n\n");
  }

  const response = await fetch(
    `${process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are an AI course copywriting assistant helping members with landing pages, sales copy, scripts, titles, and promotional content.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek 接口错误：${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "暂时没有返回内容。";
}

export async function generateImageAsset({ prompt }: ImageRequest) {
  const apiKey = process.env.OPENAI_IMAGE_API_KEY;

  if (!apiKey) {
    return {
      imageUrl:
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
            <rect width="100%" height="100%" fill="#0f1b32"/>
            <text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" fill="#f2dfba" font-size="56" font-family="Arial">Demo Image</text>
            <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#81d2d5" font-size="28" font-family="Arial">${prompt.slice(0, 50)}</text>
          </svg>`,
        ),
      revisedPrompt: "当前是演示图片。配置 OpenAI 图片 Key 后会返回真实生成结果。",
    };
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5",
      prompt,
      size: process.env.OPENAI_IMAGE_SIZE ?? "1024x1024",
      quality: process.env.OPENAI_IMAGE_QUALITY ?? "medium",
      output_format: "png",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI 图片接口错误：${errorText}`);
  }

  const data = (await response.json()) as {
    data?: Array<{
      b64_json?: string;
      revised_prompt?: string;
      url?: string;
    }>;
  };

  const asset = data.data?.[0];

  if (!asset) {
    throw new Error("图片接口没有返回结果。");
  }

  if (asset.b64_json) {
    return {
      imageUrl: `data:image/png;base64,${asset.b64_json}`,
      revisedPrompt: asset.revised_prompt ?? null,
    };
  }

  return {
    imageUrl: asset.url ?? "",
    revisedPrompt: asset.revised_prompt ?? null,
  };
}

export async function submitVideoGeneration({ duration, imageUrl, prompt }: VideoRequest) {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return {
      mode: "demo",
      requestId: `demo-${Date.now()}`,
      status: "queued",
    };
  }

  const response = await fetch(
    `${process.env.XAI_BASE_URL ?? "https://api.x.ai/v1"}/videos/generations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_VIDEO_MODEL ?? "grok-imagine-video",
        prompt,
        duration: duration ?? Number(process.env.XAI_VIDEO_DURATION ?? "8"),
        ...(imageUrl ? { image: { url: imageUrl } } : {}),
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok 视频接口错误：${errorText}`);
  }

  const data = (await response.json()) as {
    request_id?: string;
    status?: string;
  };

  return {
    mode: "live",
    requestId: data.request_id ?? "",
    status: data.status ?? "queued",
  };
}

export async function getVideoGenerationStatus(requestId: string) {
  const apiKey = process.env.XAI_API_KEY;

  if (!apiKey) {
    return {
      requestId,
      status: "done",
      videoUrl: "https://cdn.openai.com/tmp/demo-video.mp4",
    };
  }

  const response = await fetch(
    `${process.env.XAI_BASE_URL ?? "https://api.x.ai/v1"}/videos/${requestId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok 视频状态接口错误：${errorText}`);
  }

  const data = (await response.json()) as VideoStatusResponse;

  return {
    requestId: data.request_id ?? requestId,
    status: data.status ?? "processing",
    videoUrl: data.video?.url ?? null,
    errorMessage: data.error?.message ?? null,
  };
}

export function getVideoDurationDefault() {
  return Number(process.env.XAI_VIDEO_DURATION ?? "8");
}
