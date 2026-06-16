CREATE TABLE "media_folders" (
	"id" serial PRIMARY KEY,
	"parent_id" integer,
	"name" varchar(255) NOT NULL,
	"path" varchar(1024) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "medias" ADD COLUMN "folder_id" integer;--> statement-breakpoint
CREATE UNIQUE INDEX "media_folders_uq_path" ON "media_folders" ("path");--> statement-breakpoint
ALTER TABLE "media_folders" ADD CONSTRAINT "media_folders_parent" FOREIGN KEY ("parent_id") REFERENCES "media_folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "medias" ADD CONSTRAINT "medias_media_folders" FOREIGN KEY ("folder_id") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;