import { Resend } from "resend";

import { getEnv } from "../env.js";

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

let resend: Resend | undefined;

// One object so tests can swap `send` (node:test mock.method) and read the mail.
export const mailer = {
  async send(mail: Mail): Promise<void> {
    const { RESEND_API_KEY, MAIL_FROM } = getEnv();
    if (!RESEND_API_KEY) {
      console.info(`[mailer] RESEND_API_KEY unset, not sending to ${mail.to}:\n${mail.text}`);
      return;
    }
    resend ??= new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: MAIL_FROM, ...mail });
    if (error) throw new Error(`Resend rejected mail: ${error.message}`);
  },
};
