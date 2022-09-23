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
      // google-spreadsheet
      const client_email = GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const private_key = GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({ client_email, private_key });
      await doc.loadInfo();

      // sheet
      const sheet = doc.sheetsByTitle[SPREADSHEET_SHEET_TITLE];

      // get rows
      const rows = await sheet.getRows();

      // yesterday
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 1);
      cutoff.setHours(0, 0, 0, 0);

      // return json response
      let response = [];

      for (let { timestamp, page, ua, locale, country } of rows) {
        if (new Date(timestamp) < cutoff) continue;
        response.push({ timestamp, page, ua, locale, country });
      }

      return {
        statusCode: 200,
        body: JSON.stringify(response)
      };
    } catch (error) {
      console.error(`[ERROR]`, error);
      return {
        statusCode: error.statusCode || 500,
        body: JSON.stringify({
          error: error.message
        })
      };
    }
  } else {
    console.log(
      `[ENV] GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY && SPREADSHEET_ID && SPREADSHEET_SHEET_TITLE`
    );
  }
};
