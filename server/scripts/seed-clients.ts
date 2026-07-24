/**
 * Uploads client logos from server/seed-assets/clients/<Client Name>/logo.png
 * to Cloudinary and creates/updates the matching Client row. Idempotent by
 * name: an existing client is updated (logo replaced) rather than duplicated,
 * so this is safe to re-run after adding or changing folders.
 *
 * Usage: npx tsx scripts/seed-clients.ts
 */
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../src/config/prisma";
import { uploadToCloudinary } from "../src/services/image.service";

const ASSETS_DIR = path.join(__dirname, "..", "seed-assets", "clients");
const LOGO_FOLDER = "mt-portfolio/clients/logos";

function findLogoFile(dir: string): string | null {
  const names = ["logo.png", "Logo.png", "logo.PNG"];
  for (const name of names) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`No such directory: ${ASSETS_DIR}`);
    process.exit(1);
  }

  const folders = fs
    .readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));

  if (folders.length === 0) {
    console.log("No client folders found — nothing to do.");
    return;
  }

  const existing = await prisma.client.findMany();
  const maxOrder = existing.length > 0 ? Math.max(...existing.map((c) => c.order)) : -1;

  let nextOrder = maxOrder + 1;
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const name of folders) {
    const logoPath = findLogoFile(path.join(ASSETS_DIR, name));
    if (!logoPath) {
      console.warn(`⚠ ${name}: no logo.png found — skipped`);
      skipped++;
      continue;
    }

    const buffer = fs.readFileSync(logoPath);
    const uploaded = await uploadToCloudinary(buffer, LOGO_FOLDER);

    const match = existing.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) {
      await prisma.client.update({ where: { id: match.id }, data: { logoUrl: uploaded.secure_url } });
      console.log(`↻ ${name}: logo updated`);
      updated++;
    } else {
      await prisma.client.create({
        data: { name, logoUrl: uploaded.secure_url, order: nextOrder },
      });
      console.log(`✔ ${name}: created (order ${nextOrder})`);
      nextOrder++;
      created++;
    }
  }

  console.log(`\nDone — created: ${created}, updated: ${updated}, skipped: ${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
