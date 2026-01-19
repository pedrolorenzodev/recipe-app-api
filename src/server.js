import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";

const app = express();
const PORT = ENV.PORT || 5001;

app.use(express.json()); // if you don't add this, all of the fields (line 17) will be UNDEFINED

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

// First endpoint (Add Favorites)
app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId | !recipeId | !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newFavorite = await db
      .insert(favoritesTable)
      .values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      })
      .returning(); // if you don't pass anything is going to return all the fields

    res.status(201).json(newFavorite[0]);
  } catch (e) {
    console.log("Error adding favorite", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// FETCH OPERATION (Visualize Favorites on Favorites Screen)
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.log("Error fetching the favorites", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/// DELETE OPERATION (Remove Favorites)
app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db.delete(favoritesTable).where(
      and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.recipeId, parseInt(recipeId)) // "parseInt" ((Because in our schema we declared our recipeId))  to be equal to "integer"
      )
    );

    res.status(200).json({ error: "Favorite removed successfully" });
  } catch (e) {
    console.log("Error removing a favorite", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});
///

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
