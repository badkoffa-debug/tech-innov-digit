import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { defaultContent } from "@/data/default-content";
import type { BlogPost, SiteContent, Training } from "@/types/content";

const REDIS_KEY = "techinnov:site-content:v1";
const localContentPath = path.join(process.cwd(), "data", "site-content.json");

function cloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content)) as SiteContent;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => asString(item).trim()).filter(Boolean)
    : [];
}

function normalizeTraining(item: Partial<Training>, index: number): Training {
  return {
    id: asString(item.id) || `formation-${index + 1}`,
    title: asString(item.title),
    category: asString(item.category),
    duration: asString(item.duration),
    priceOnline: asString(item.priceOnline),
    pricePresentiel: asString(item.pricePresentiel),
    mode: asString(item.mode),
    level: asString(item.level),
    description: asString(item.description),
    program: asStringArray(item.program),
    published: item.published !== false
  };
}

function normalizeBlogPost(item: Partial<BlogPost>, index: number): BlogPost {
  return {
    id: asString(item.id) || `article-${index + 1}`,
    title: asString(item.title),
    category: asString(item.category),
    publishedAt: asString(item.publishedAt),
    author: asString(item.author),
    image: asString(item.image),
    excerpt: asString(item.excerpt),
    keywords: asString(item.keywords),
    content: asString(item.content),
    published: item.published !== false
  };
}

export function normalizeContent(value: unknown): SiteContent {
  const content =
    value && typeof value === "object" ? (value as Partial<SiteContent>) : {};

  const trainings = Array.isArray(content.trainings)
    ? content.trainings.map(normalizeTraining)
    : cloneContent(defaultContent).trainings;

  const blogPosts = Array.isArray(content.blogPosts)
    ? content.blogPosts.map(normalizeBlogPost)
    : cloneContent(defaultContent).blogPosts;

  return {
    trainings,
    blogPosts,
    updatedAt: asString(content.updatedAt) || new Date().toISOString()
  };
}

async function redisCommand(command: unknown[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("La base de données n'a pas répondu correctement.");
  }

  return (await response.json()) as { result?: unknown };
}

async function readRedisContent(): Promise<SiteContent | null> {
  const response = await redisCommand(["GET", REDIS_KEY]);
  if (!response?.result) return null;
  const result = response.result;
  const parsed =
    typeof result === "string" ? JSON.parse(result) : (result as unknown);
  return normalizeContent(parsed);
}

async function writeRedisContent(content: SiteContent) {
  const response = await redisCommand([
    "SET",
    REDIS_KEY,
    JSON.stringify(content)
  ]);
  return response !== null;
}

async function readLocalContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(localContentPath, "utf8");
    return normalizeContent(JSON.parse(raw));
  } catch {
    const content = cloneContent(defaultContent);
    await writeLocalContent(content);
    return content;
  }
}

async function writeLocalContent(content: SiteContent) {
  await fs.mkdir(path.dirname(localContentPath), { recursive: true });
  await fs.writeFile(localContentPath, JSON.stringify(content, null, 2), "utf8");
}

export async function getSiteContent(): Promise<SiteContent> {
  noStore();
  const redisContent = await readRedisContent();
  if (redisContent) return redisContent;
  return readLocalContent();
}

export async function getPublicContent(): Promise<SiteContent> {
  const content = await getSiteContent();
  return {
    ...content,
    trainings: content.trainings.filter((item) => item.published),
    blogPosts: content.blogPosts.filter((item) => item.published)
  };
}

export async function saveSiteContent(nextContent: SiteContent) {
  const normalized = normalizeContent({
    ...nextContent,
    updatedAt: new Date().toISOString()
  });

  const wroteToRedis = await writeRedisContent(normalized);
  if (!wroteToRedis) {
    await writeLocalContent(normalized);
  }

  return normalized;
}

export function isAdminPassword(value: string | null) {
  const configuredPassword = process.env.ADMIN_PASSWORD || "TECH2026";
  return Boolean(value && value === configuredPassword);
}
