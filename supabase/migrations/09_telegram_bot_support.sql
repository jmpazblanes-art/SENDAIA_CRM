-- Migration: Add telegram bot support columns
-- Adds telegram_chat_id to chat_messages for conversation memory
-- Adds google_event_id to appointments for calendar sync
-- Extends chat_messages role constraint to include 'note' and 'tool'

-- 1. Add telegram_chat_id to chat_messages
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

CREATE INDEX IF NOT EXISTS idx_chat_messages_telegram_chat_id
  ON public.chat_messages(telegram_chat_id);

-- 2. Drop and recreate role constraint to allow 'note' and 'tool'
ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_role_check;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_role_check
  CHECK (role IN ('user', 'assistant', 'note', 'tool', 'system'));

-- 3. Make employee_id optional (Telegram messages won't have one)
ALTER TABLE public.chat_messages
  ALTER COLUMN employee_id DROP NOT NULL;

-- 4. Add google_event_id to appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- 5. RLS: allow service role full access to chat_messages (for the bot)
CREATE POLICY "Enable insert for service role" ON public.chat_messages
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON public.chat_messages
  FOR ALL TO service_role USING (true);
