import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import type { PrismaClient } from "../../generated/prisma/client.js";

type UserSeedEntry = {
  login: string;
  password: string;
};

type UserSeedData = {
  users: UserSeedEntry[];
};

function loadData(): UserSeedData {
  const dataPath = join(dirname(fileURLToPath(import.meta.url)), "data.json");
  return JSON.parse(readFileSync(dataPath, "utf-8")) as UserSeedData;
}

export async function seed(prisma: PrismaClient): Promise<void> {
  const { users } = loadData();

  for (const { login, password } of users) {
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
      where: { login },
      update: { passwordHash },
      create: { login, passwordHash },
    });
  }

  console.log(
    `Seeded ${users.length} users: ${users.map((u) => u.login).join(", ")}`,
  );
}
