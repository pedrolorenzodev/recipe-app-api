import {drizzle} from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import { ENV } from "./env.js"
import * as schema from "../db/schema.js"

const sql = neon(ENV.DATABASE_URL)
export const db = drizzle(sql, {schema}) // we put our schema, in the neon database (using drizzle)
