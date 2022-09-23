const { GoogleSpreadsheet } = require("google-spreadsheet");
const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  SPREADSHEET_ID,
  SPREADSHEET_SHEET_TITLE
} = process.env;

exports.handler = async (event, context) => {
  if (
    GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    GOOGLE_PRIVATE_KEY &&
    SPREADSHEET_ID &&
    SPREADSHEET_SHEET_TITLE
  ) {
    try {
      // netlify
      const { headers: eventHeaders, queryStringParameters: eventParams = '' } = event;
      const { host } = eventHeaders;
      const {
        referer = `https://${host}`,
        "user-agent": ua,
        "x-language": locale,
        "x-country": country
      } = eventHeaders;

      const timestamp = new Date().toISOString();
      const { pathname: page } = new URL(referer);
      const headers = JSON.stringify(eventHeaders);
      const params = JSON.stringify(eventParams);

      // columns
      const row = {
        timestamp,
        page,
        params,
        ua,
        locale,
        country,
        headers
      };

      // google-spreadsheet
      const client_email = GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const private_key = GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({ client_email, private_key });
      await doc.loadInfo();

      // store
      const sheet = doc.sheetsByTitle[SPREADSHEET_SHEET_TITLE];
      const addedRow = await sheet.addRow(row);
    } catch (error) {
      console.error(`[ERROR]`, error);
    }
  } else {
    console.log(
      `[ENV] GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY && SPREADSHEET_ID && SPREADSHEET_SHEET_TITLE`
    );
  }

  // transparent gif
  return {
    statusCode: 200,
    body: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    headers: { "content-type": "image/gif" },
    isBase64Encoded: true
  };
};
