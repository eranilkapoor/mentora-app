import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type TutorContext = {
  subject?: {
    name?: string;
    code?: string;
    category?: string;
  };
  schedule?: {
    title?: string;
    deliveryMode?: string;
  };
  safety?: {
    contentRestrictionLevel?: string;
    externalLinksEnabled?: boolean;
  };
};

export type AiTutorProviderResult = {
  content: string;
  metadata: {
    demoMode: boolean;
    model: string;
    provider: string;
    usage: {
      estimatedInputTokens: number;
      estimatedOutputTokens: number;
      meteredUnits: number;
    };
  };
};

@Injectable()
export class AiTutorProviderService {
  constructor(private readonly configService: ConfigService) {}

  generateTutorReply(input: {
    context: TutorContext;
    message: string;
    messageType: string;
  }): AiTutorProviderResult {
    const demoMode = this.configService.get<boolean>(
      'integrations.demoMode',
      true,
    );
    const provider = this.configService.get<string>(
      'integrations.ai.provider',
      'openai',
    );
    const model = this.configService.get<string>(
      'integrations.ai.model',
      'gpt-4o-mini',
    );

    return {
      content: this.buildSandboxExplanation(input),
      metadata: {
        demoMode,
        model,
        provider: demoMode ? `${provider}:sandbox` : provider,
        usage: {
          estimatedInputTokens: this.estimateTokens(input.message),
          estimatedOutputTokens: 120,
          meteredUnits: 1,
        },
      },
    };
  }

  private buildSandboxExplanation(input: {
    context: TutorContext;
    message: string;
    messageType: string;
  }) {
    const subject = input.context.subject?.name ?? 'this subject';
    const schedule = input.context.schedule?.title;
    const safeLinks = input.context.safety?.externalLinksEnabled
      ? 'External resources are enabled for this profile.'
      : 'I will keep this explanation inside Mentora without external links.';
    const prompt = input.message.trim();
    return [
      `Let's work through ${subject} step by step.`,
      schedule ? `This is linked to your scheduled session: ${schedule}.` : '',
      `Your question: "${prompt.slice(0, 220)}"`,
      '1. First, identify the key concept in the question.',
      '2. Then solve the smallest part of the problem before combining steps.',
      '3. Finally, check the answer by explaining it back in your own words.',
      input.messageType === 'quiz'
        ? 'Try one answer first; I can then give a hint or review your reasoning.'
        : 'Share your next attempt and I will adapt the next hint.',
      safeLinks,
    ]
      .filter(Boolean)
      .join('\n');
  }

  private estimateTokens(value: string) {
    return Math.max(1, Math.ceil(value.trim().length / 4));
  }
}
