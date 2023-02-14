import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
    name?: string;
    error?: Error;
    result?: string;
    response?: string;
  }

  type Error = {
    message: string;
    name?: string;
    stack?: string;
    response?: string;
  };

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const defaultValue = {
  review:  `Write a restaurant review based on these notes: Name: The Blue Wharf Lobster great, noisy service polite, prices good. Review:`,
  table:  `A table summarizing the fruits from Goocrux:\n\nThere are many fruits that were found on the recently discovered planet Goocrux. There are neoskizzles that grow there, which are purple and taste like candy. There are also loheckles, which are a grayish blue fruit and are very tart, a little bit like a lemon. Pounits are a bright green color and are more savory than sweet. There are also plenty of loopnovas which are a neon pink flavor and taste like cotton candy. Finally, there are fruits called glowls, which have a very sour and bitter taste which is acidic and caustic, and a pale orange tinge to them.\n\n| Fruit | Color | Flavor |`,
};

export default async function generate(req: NextApiRequest,
    res: NextApiResponse<Data>) {

  if (!configuration.apiKey) {
    const error: Error = {
        message: "An error occurred"
      };
      res.status(500).json({ name: "error", error });
        return;
  }

  try {
    const completion: any = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt().table,
      temperature: 0.5,
      maxTokens: 60,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
    } as CreateCompletionRequest);

    res.status(200).json({ result: completion.data.choices[0].text });
    // console.log(generatePrompt());
    return;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error && 'response' in error) {
        if (error.response) {
            if (error.response.status === 429) {
              res.status(429).json({
                error: {
                  message: "Too many requests!",
                },
              });
            }
          } else {
            res.status(500).json({
              error: {
                message: "An error occurred during your request.",
              },
            });
          }
      } else {
        console.error(error);
      }
  }
  // res.status(error.response.status).json(error.response.data);
}