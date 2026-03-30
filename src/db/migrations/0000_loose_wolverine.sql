CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" integer NOT NULL,
	"title" text NOT NULL,
	"image" text NOT NULL,
	"cook_time" text,
	"servings" integer,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "pushToken" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text UNIQUE NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "ticketSuccessId" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"token" text UNIQUE NOT NULL,
	"created_at" timestamp DEFAULT now()
)