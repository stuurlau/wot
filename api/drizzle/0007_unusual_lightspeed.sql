ALTER TABLE "training_session_exercises" RENAME COLUMN "body_regions" TO "body_parts";--> statement-breakpoint
ALTER TABLE "exercise_configs" RENAME COLUMN "body_regions" TO "body_parts";--> statement-breakpoint
UPDATE "training_session_exercises" AS e
SET "body_parts" = mapped.body_parts
FROM (
	SELECT src.id, array_agg(DISTINCT CASE label
		WHEN 'chest' THEN 'chest'
		WHEN 'back' THEN 'back'
		WHEN 'shoulders' THEN 'shoulders'
		WHEN 'arms' THEN 'arms'
		WHEN 'neck' THEN 'neck'
		WHEN 'biceps' THEN 'biceps'
		WHEN 'triceps' THEN 'triceps'
		WHEN 'forearms' THEN 'forearms'
		WHEN 'core' THEN 'core'
		WHEN 'abs' THEN 'abs'
		WHEN 'obliques' THEN 'obliques'
		WHEN 'lats' THEN 'lats'
		WHEN 'upperback' THEN 'upperback'
		WHEN 'lowerback' THEN 'lowerback'
		WHEN 'glutes' THEN 'glutes'
		WHEN 'hips' THEN 'hips'
		WHEN 'quads' THEN 'quads'
		WHEN 'hamstrings' THEN 'hamstrings'
		WHEN 'calves' THEN 'calves'
		WHEN 'legs' THEN 'lower'
		WHEN 'lower' THEN 'lower'
		WHEN 'upper' THEN 'upper'
		ELSE NULL
	END) AS body_parts
	FROM "training_session_exercises" AS src, unnest(src."body_parts") AS label
	GROUP BY src.id
) AS mapped
WHERE e.id = mapped.id;--> statement-breakpoint
UPDATE "exercise_configs" AS c
SET "body_parts" = mapped.body_parts
FROM (
	SELECT src.id, array_agg(DISTINCT CASE label
		WHEN 'chest' THEN 'chest'
		WHEN 'back' THEN 'back'
		WHEN 'shoulders' THEN 'shoulders'
		WHEN 'arms' THEN 'arms'
		WHEN 'neck' THEN 'neck'
		WHEN 'biceps' THEN 'biceps'
		WHEN 'triceps' THEN 'triceps'
		WHEN 'forearms' THEN 'forearms'
		WHEN 'core' THEN 'core'
		WHEN 'abs' THEN 'abs'
		WHEN 'obliques' THEN 'obliques'
		WHEN 'lats' THEN 'lats'
		WHEN 'upperback' THEN 'upperback'
		WHEN 'lowerback' THEN 'lowerback'
		WHEN 'glutes' THEN 'glutes'
		WHEN 'hips' THEN 'hips'
		WHEN 'quads' THEN 'quads'
		WHEN 'hamstrings' THEN 'hamstrings'
		WHEN 'calves' THEN 'calves'
		WHEN 'legs' THEN 'lower'
		WHEN 'lower' THEN 'lower'
		WHEN 'upper' THEN 'upper'
		ELSE NULL
	END) AS body_parts
	FROM "exercise_configs" AS src, unnest(src."body_parts") AS label
	GROUP BY src.id
) AS mapped
WHERE c.id = mapped.id;
