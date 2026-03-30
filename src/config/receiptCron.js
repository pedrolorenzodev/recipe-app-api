import cron from "cron";
import { db } from "./db.js";
import { pushTokenTable, ticketSuccessIdTable} from "../db/schema.js";
import Expo from "expo-server-sdk";
import { eq } from "drizzle-orm";

const expo = new Expo()

const receiptCron = new cron.CronJob("*/30 * * * *", async () => {
    try {
        const ticketsSuccess = await db.select().from(ticketSuccessIdTable)
        const ticketSuccessId = ticketsSuccess.map((ticketSuccess) => ticketSuccess.ticketId)
        if (ticketSuccessId.length === 0) return;

        const receiptsId = await expo.getPushNotificationReceiptsAsync(ticketSuccessId)

        const errorReceipts = Object.entries(receiptsId)
        .filter(([, receipt]) => receipt.status === "error" &&  receipt.details?.error === "DeviceNotRegistered")
        
        for (const [ticketId] of errorReceipts) {
                const match = ticketsSuccess.find((t) => t.ticketId === ticketId)
                if (match) {
                    await db.delete(pushTokenTable).where(eq(pushTokenTable.token, match.token))
                }
            }

        for (const ticketId of ticketSuccessId) {
            await db.delete(ticketSuccessIdTable).where(eq(ticketSuccessIdTable.ticketId, ticketId))
        }
    } catch (error) {
        console.error("Error getting receipts", error);
        return null;
    }
})

export default receiptCron;