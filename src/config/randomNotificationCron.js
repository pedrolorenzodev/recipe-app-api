import cron from "cron";
import { db } from "./db.js";
import { pushTokenTable, ticketSuccessIdTable } from "../db/schema.js";
import Expo from "expo-server-sdk";
import { eq } from "drizzle-orm";

const expo = new Expo()

const randomNotificationCron = new cron.CronJob("0 12 * * *", async () => {
    try {
        const BASE_URL = "https://www.themealdb.com/api/json/v1/1"
        const response = await fetch(`${BASE_URL}/random.php`)
        const data = await response.json();
        if (!data.meals || data.meals.length === 0) return;
        const randomMeal = data.meals[0]

        const targetPushTokens = await db.select().from(pushTokenTable)
        if (targetPushTokens.length === 0) return;

        const messages = targetPushTokens.map((targetPushToken) => {
          if (!Expo.isExpoPushToken(targetPushToken.token)) {
            console.warn(`Push token ${targetPushToken.token} is not a valid Expo push token`);
            return null;
          }

          return {
            to: targetPushToken.token,
            title: `We think you'll love this ${randomMeal.strArea} recipe!`,
            body: randomMeal.strMeal,
            data: { mealId: randomMeal.idMeal },
            richContent: {
              image: randomMeal.strMealThumb
            }
          }
        }).filter(Boolean)
        
        const chunks = expo.chunkPushNotifications(messages);
        let tickets = [];

        for (const chunk of chunks) {
          try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            console.error(error);
          }
        }
        
        const ticketError = tickets.filter((ticket) => ticket.status === 'error' && ticket.details?.error === "DeviceNotRegistered")
        const ticketErrorToken = ticketError.map((ticket) => ticket.details.expoPushToken)
        
        for (const token of ticketErrorToken) {
          await db.delete(pushTokenTable).where(eq(pushTokenTable.token, token))
        }

        const ticketWithTokens = tickets.map((ticket, index) => ({ticket, token: messages[index].to}))

        const ticketValues = ticketWithTokens
        .filter(({ticket}) => ticket.status === "ok")
        .map(({ticket, token}) => ({ ticketId: ticket.id, token }))

        for (const {token, ticketId} of ticketValues) {
          await db.insert(ticketSuccessIdTable).values({ticketId, token})
        }
    } catch (error) {
      console.error("Error getting random meal", error);
      return null;
    }
  })
  
export default randomNotificationCron;