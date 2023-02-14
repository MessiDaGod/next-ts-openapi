import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession } from "next-iron-session";

export default function withSession(handler: (req: NextApiRequest, res: NextApiResponse<any>) => Promise<void>) {
  return withIronSession(handler, {
    password: !process.env.SECRET_COOKIE_PASSWORD ? "" : process.env.SECRET_COOKIE_PASSWORD,
    cookieName: "myapp_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production" ? true : false,
    },
  });
}
