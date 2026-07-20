CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
DO $$
DECLARE
	test_hash text;
BEGIN
	IF EXISTS (
		SELECT 1
		FROM users
		WHERE password_hash !~ E'^\\$2[ab]\\$[0-9]{2}\\$[./A-Za-z0-9]{53}$'
	) THEN
		RAISE EXCEPTION 'Unsupported password hash format; expected bcrypt $2a$ or $2b$';
	END IF;

	UPDATE users
	SET password_hash = '$2a$' || substring(password_hash FROM 5)
	WHERE password_hash LIKE '$2b$%';

	test_hash := crypt('padelix-pgcrypto-check', gen_salt('bf', 10));
	IF crypt('padelix-pgcrypto-check', test_hash) <> test_hash
		OR crypt('wrong-password', test_hash) = test_hash THEN
		RAISE EXCEPTION 'pgcrypto bcrypt self-check failed';
	END IF;
END
$$;
