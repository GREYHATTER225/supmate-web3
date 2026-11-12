import { Router, Request, Response } from "express";

export const profileRouter = Router();

// In-memory LRU cache
const profileCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

profileRouter.get("/:identifier", async (req: Request, res: Response) => {
  const { identifier } = req.params;
  const nodeUrl = process.env.DESO_NODE_URL || "https://node.deso.org";

  const cached = profileCache.get(identifier);
  if (cached && cached.expiry > Date.now()) {
    return res.json({ profile: cached.data, cached: true });
  }

  try {
    const isPublicKey = identifier.startsWith("BC") || identifier.startsWith("tBC");
    const payload = isPublicKey
      ? { PublicKeyBase58Check: identifier }
      : { Username: identifier };

    const nodeRes = await fetch(`${nodeUrl}/api/v0/get-single-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!nodeRes.ok) {
      return res.status(nodeRes.status).json({ error: "Node lookup failed" });
    }

    const data = (await nodeRes.json()) as any;
    const profile = data?.Profile || null;

    if (profile) {
      profileCache.set(identifier, { data: profile, expiry: Date.now() + CACHE_TTL_MS });
      if (profile.PublicKeyBase58Check) {
        profileCache.set(profile.PublicKeyBase58Check, { data: profile, expiry: Date.now() + CACHE_TTL_MS });
      }
      if (profile.Username) {
        profileCache.set(profile.Username.toLowerCase(), { data: profile, expiry: Date.now() + CACHE_TTL_MS });
      }
    }

    return res.json({ profile, cached: false });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});
