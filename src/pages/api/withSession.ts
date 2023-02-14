import { NextApiRequest, NextApiResponse } from "next";
import withSession from "../session";

export default withSession(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Your API logic goes here
});
