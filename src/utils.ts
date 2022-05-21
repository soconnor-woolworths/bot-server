import { createHash } from "crypto";

export function hashUrl(url: string, baseUrl?: string): string {
  return createHash("sha1")
    .update(
      `${
        baseUrl || process.env.BASE_URL || "https://www.woolworths.com.au"
      }${url}`
    )
    .digest("base64");
}
