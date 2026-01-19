import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", () => {
  https
  .get(process.env.API_URL, (res) => {
    if (res.statusCode === 200) console.log("Get request sent successfully")
    else console.log("Get request failed", res.statusCode);
  })
  .on("error", (e) => console.error("Error while sending request", e))
});

export default job;

// CRON JOB EXPLANATION:
// CRON jovs are scheduled tasks that run periodically at fixed intervals
// we want to send 1 GET request every 14 minutes so that our api never gets inactive on Render.com

// How to define a "Schedule"?
// You define a schedule using a cron expression, wich consists of 5 fields representing:

//! MINUTE, HOUR, DAY OF MONTH, MONTH, DAY OF WEEK

//? EXAMPLES && EXPLANATION:
//* 14 * * * * - Runs every 14 minutes
//* 0 0 * * 0 - At midnight every Sunday
//* 30 3 15 * * - At 3:30 AM, on the 15th day of every month
//* 0 0 1 1 * - At midnight, on January 1st
//* 0 * * * * - Every hour