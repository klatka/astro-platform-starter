/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly WEBHOOK_URL?: string;
    /** Resend API key used as the SMTP password for smtp.resend.com */
    readonly RESEND_API_KEY?: string;
    /** From-address used when sending emails via Resend (e.g. "noreply@yourdomain.com") */
    readonly RESEND_FROM_EMAIL?: string;
    /** Supabase project URL (e.g. "https://xyzcompany.supabase.co") */
    readonly SUPABASE_URL?: string;
    /** Supabase anonymous (public) key */
    readonly SUPABASE_ANON_KEY?: string;
    /** Supabase service-role key – preferred over anon key for server-side inserts */
    readonly SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
