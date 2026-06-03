export type UserPlan = 'basic' | 'pro'
export type UserStatus = 'active' | 'inactive'
export type PaymentStatus = 'paid' | 'pending' | 'expired'
export type MessageRole = 'user' | 'assistant'

export interface User {
  id: string
  email: string
  full_name: string
  access_code: string | null
  plan: UserPlan
  messages_limit: number
  messages_used_this_month: number
  activation_date: string | null
  expiration_date: string | null
  payment_status: PaymentStatus
  status: UserStatus
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  file_url: string | null
  file_type: string | null
  created_at: string
}

export interface ChatRequest {
  message: string
  conversation_id?: string
  file_url?: string
  file_type?: string
}

export interface ChatResponse {
  message: Message
  assistant_message: Message
  conversation_id: string
  messages_used: number
  messages_limit: number
}

export interface AdminUserUpdate {
  full_name?: string
  access_code?: string
  plan?: UserPlan
  messages_limit?: number
  activation_date?: string
  expiration_date?: string
  payment_status?: PaymentStatus
  status?: UserStatus
  is_admin?: boolean
}
