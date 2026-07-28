import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import config from '@/lib/config';

const sql = neon("postgresql://neondb_owner:npg_MbInio9t4ufw@ep-gentle-sea-asouoriw-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export const db = drizzle({ client: sql });
