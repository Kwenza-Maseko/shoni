import { db } from "@/database/drizzle";
import { bank } from "@/database/schema";


async function seed() {
    await db
        .insert(bank)
        .values([
            {
                bankName: "Capitec Bank",
                charges: "1.00",
            },
            {
                bankName: "Nedbank Bank",
                charges: "6.00",
            },
            {
                bankName: "GoTyme Bank",
                charges: "6.00",
            },
            {
                bankName: "Standard Bank",
                charges: "6.00",
            },
            {
                bankName: "FNB Bank",
                charges: "6.00",
            },
            {
                bankName: "Send Cash",
                charges: "10.00",
            },
        ])
        .onConflictDoNothing();

    console.log("Seeding complete.");
}

seed()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(() => process.exit(0));