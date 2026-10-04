/**
 * Telegram deep links.
 *
 * Format (https://core.telegram.org/api/links#public-username-links):
 *   https://t.me/<username>?text=<draft_text>
 * The text is placed in the message box as a draft — it is never sent
 * automatically. The https form is used instead of tg:// because it falls back
 * to Telegram's own web page ("Open in Telegram" / install) when the app is
 * not installed.
 */
export function telegramChatUrl(username: string, draftText?: string): string {
  const base = `https://t.me/${encodeURIComponent(username)}`;
  const text = draftText?.trim();
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
