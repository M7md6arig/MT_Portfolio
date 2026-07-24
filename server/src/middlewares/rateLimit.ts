import rateLimit from "express-rate-limit";

/** 5 attempts per 15 minutes per IP — the login endpoint itself. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many login attempts. Please try again in 15 minutes. / محاولات دخول كثيرة جدًا، حاول مرة أخرى بعد 15 دقيقة.",
  },
});
