const {GoogleSpreadsheet} = require('google-spreadsheet');
const qs = require('qs');
const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  SPREADSHEET_ID,
  SPREADSHEET_SHEET_FORM_TITLE,
  APEX_DOMAIN,
  TG_TOKEN,
  TG_CHAT,
} = process.env;

const REDIRECT_URL_SUCCESS = ['https://', APEX_DOMAIN, 'success.html'].join(
  '/',
);

function redirectUrl(url) {
  return {
    statusCode: 302,
    headers: {
      Location: url,
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({}),
  };
}

exports.handler = async (event, context) => {
  const {Telegram} = await import('@brthlmy/serverless-telegram-notifier');
  if (
    GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    GOOGLE_PRIVATE_KEY &&
    SPREADSHEET_ID &&
    SPREADSHEET_SHEET_FORM_TITLE &&
    APEX_DOMAIN
  ) {
    if (!event.body || event.httpMethod !== 'POST') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          status: 'invalid-method',
        }),
      };
    }

    try {
      // form
      const timestamp = new Date().toISOString();

      const {headers: eventHeaders, body: formData} = event;
      const {host} = eventHeaders;

      const {
        referer = `https://${host}`,
        'user-agent': ua,
        'x-language': locale,
        'x-country': country,
      } = eventHeaders;

      // block request, based on referer
      const {host: hostReferer} = new URL(referer);
      const refererApexDomain = hostReferer.replace('www.', '');

      if (refererApexDomain !== APEX_DOMAIN) {
        return {
          statusCode: 418,
          body: JSON.stringify({status: "I'm a teapot"}),
        };
      }

      const {'form-name': formName, ...restFormData} = qs.parse(formData);

      const row = {
        timestamp,
        formName,
        formData: JSON.stringify(restFormData),
        country,
        locale,
        ua,
      };

      // google-spreadsheet
      const client_email = GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const private_key = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({client_email, private_key});
      await doc.loadInfo();

      // store
      const sheet = doc.sheetsByTitle[SPREADSHEET_SHEET_FORM_TITLE];
      const addedRow = await sheet.addRow(row);

      // initialize with authorization access token for telegram bot
      const telegram = new Telegram({
        accessToken: TG_TOKEN,
      });

      const messageFieldsValues = Object.entries(restFormData)
        .map(item => `<b>${item[0]}</b>: ${item[1]}`)
        .join('\n')
        .slice(0, 1000);

      const message = await telegram.sendMessage({
        chat_id: TG_CHAT,
        text: `${APEX_DOMAIN} #(${addedRow._rowNumber})\n${timestamp}\n\nForm: ${formName}\n${messageFieldsValues}\n\nCountry:${country} (${locale})\n`,
        parse_mode: 'HTML',
        disable_notification: true,
        disable_web_page_preview: true,
      });

    } catch (error) {
      console.error(error);
      return {
        statusCode: error.statusCode || 500,
        body: JSON.stringify({
          error: error.message,
        }),
      };
    }
  } else {
    console.log(
      `[ENV] GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY && SPREADSHEET_ID && SPREADSHEET_SHEET_FORM_TITLE && APEX_DOMAIN`,
    );
  }

  return redirectUrl(REDIRECT_URL_SUCCESS);
};
