const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  SPREADSHEET_ID,
  SPREADSHEET_SHEET_FORM_TITLE,
  APEX_DOMAIN,
  TG_TOKEN,
  TG_CHAT,
} = process.env;

exports.handler = async (event, context) => {
  try {
    const {handler} = await import('@brthlmy/serverless-netlify-form');
    const result = await handler(event, {
      googleServiceAccountEmail: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      googlePrivateKey: GOOGLE_PRIVATE_KEY,
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetSheetTitle: SPREADSHEET_SHEET_FORM_TITLE,
      apexDomain: APEX_DOMAIN,
    });

    if (result.message) {
      const {Telegram} = await import('@brthlmy/serverless-telegram-notifier');
      const telegram = new Telegram({
        accessToken: TG_TOKEN,
      });

      const message = await telegram.sendMessage({
        chat_id: TG_CHAT,
        text: `${APEX_DOMAIN}\n\n${result.message}`,
        parse_mode: 'HTML',
        disable_notification: true,
        disable_web_page_preview: true,
      });
    }
    return result.redirectResponse;
  } catch (e) {
    console.log('debug', e);
  }
};
