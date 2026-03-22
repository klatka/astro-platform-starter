import nodemailer from 'nodemailer';

export interface LeadEmailData {
    vorname: string;
    nachname: string;
    email: string;
    telefon?: string;
    plz?: string;
    gebaeudetyp?: string;
    baujahr?: string;
    bereiche?: string[];
    kaufmotive?: string[];
    painPoints?: string[];
    budget?: string;
    zeitplanung?: string;
}

/** Escape characters that have special meaning in HTML to prevent XSS in email bodies. */
function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function createResendTransport(apiKey: string) {
    return nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
            user: 'resend',
            pass: apiKey
        }
    });
}

async function createEtherealTransport() {
    const testAccount = await nodemailer.createTestAccount();
    console.log('[email] Using Ethereal test account:', testAccount.user);
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
}

export async function sendLeadConfirmation(data: LeadEmailData): Promise<void> {
    const fromAddress = import.meta.env.RESEND_FROM_EMAIL ?? 'noreply@example.com';
    const resendApiKey = import.meta.env.RESEND_API_KEY;
    const isProduction = typeof resendApiKey === 'string' && resendApiKey.length > 0;

    const transport = isProduction ? createResendTransport(resendApiKey!) : await createEtherealTransport();

    const vorname = escapeHtml(data.vorname);
    const nachname = escapeHtml(data.nachname);
    const email = escapeHtml(data.email);
    const telefon = data.telefon ? escapeHtml(data.telefon) : null;
    const plz = data.plz ? escapeHtml(data.plz) : null;
    const gebaeudetyp = data.gebaeudetyp ? escapeHtml(data.gebaeudetyp) : null;
    const baujahr = data.baujahr ? escapeHtml(data.baujahr) : null;
    const budget = data.budget ? escapeHtml(data.budget) : null;
    const zeitplanung = data.zeitplanung ? escapeHtml(data.zeitplanung) : null;
    const bereicheList = data.bereiche?.map(escapeHtml).join(', ') ?? '–';

    const htmlBody = `
        <h2>Danke für Ihre Anfrage, ${vorname}!</h2>
        <p>Wir haben Ihren Smart Home Konfigurator-Eintrag erhalten und melden uns in Kürze bei Ihnen.</p>
        <h3>Ihre Angaben</h3>
        <ul>
            <li><strong>Name:</strong> ${vorname} ${nachname}</li>
            <li><strong>E-Mail:</strong> ${email}</li>
            ${telefon ? `<li><strong>Telefon:</strong> ${telefon}</li>` : ''}
            ${plz ? `<li><strong>PLZ:</strong> ${plz}</li>` : ''}
            ${gebaeudetyp ? `<li><strong>Gebäudetyp:</strong> ${gebaeudetyp}</li>` : ''}
            ${baujahr ? `<li><strong>Baujahr:</strong> ${baujahr}</li>` : ''}
            ${budget ? `<li><strong>Budget:</strong> ${budget}</li>` : ''}
            ${zeitplanung ? `<li><strong>Zeitplanung:</strong> ${zeitplanung}</li>` : ''}
            <li><strong>Gewünschte Bereiche:</strong> ${bereicheList}</li>
        </ul>
        <p>Mit freundlichen Grüßen,<br>Ihr Smart Home Team</p>
    `;

    const info = await transport.sendMail({
        from: fromAddress,
        to: data.email,
        subject: 'Ihre Smart Home Anfrage – Wir haben Ihre Angaben erhalten',
        html: htmlBody
    });

    if (!isProduction) {
        console.log('[email] Preview URL:', nodemailer.getTestMessageUrl(info));
    }
}
