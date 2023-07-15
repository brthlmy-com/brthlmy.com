exports.handler = async (event, context) => {
  const { handler } from "@brthlmy/serverless-netlify-doorbell";
  const result = await handler(event, { ...process.env });
  return result;
};
