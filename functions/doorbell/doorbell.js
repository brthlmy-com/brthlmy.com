const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  SPREADSHEET_ID,
  SPREADSHEET_SHEET_TITLE,
  APEX_DOMAIN,
} = process.env;

exports.handler = async (event, context) => {
  try {
    const {handler} = await import('@brthlmy/serverless-netlify-doorbell');
    const result = await handler(event, {
      googleServiceAccountEmail: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      googlePrivateKey: GOOGLE_PRIVATE_KEY,
      spreadsheetId: SPREADSHEET_ID,
      spreadsheetSheetTitle: SPREADSHEET_SHEET_TITLE,
      apexDomain: APEX_DOMAIN,
    });
    return result;
  } catch(e) {
    console.log('debug',e);
  }
};
