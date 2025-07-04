export interface TelegramBotConfig {
  is_enabled: boolean;
  webhook_url: string | null;
  default_survey_id: number | null;
  settings: Record<string, any>;
}

export interface TelegramBotConfigRequest {
  bot_token?: string;
  webhook_url?: string;
  is_enabled: boolean;
  default_survey_id?: number;
  settings?: Record<string, any>;
}

export interface TelegramBotUser {
  id: number;
  telegram_user_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  is_authenticated: boolean;
  user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramConversation {
  id: number;
  telegram_user_id: string;
  chat_id: string;
  state: string;
  context: Record<string, any>;
  survey_id: number | null;
  post_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramBotStats {
  total_users: number;
  total_conversations: number;
  total_submissions: number;
  active_conversations: number;
  messages_today: number;
  total_messages: number;
  surveys_completed: number;
  bot_status: 'online' | 'offline';
}

export interface TelegramWebhookSetupResponse {
  message: string;
  webhook_url: string;
}
