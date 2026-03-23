import { useState, useEffect, useRef } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
    // Step 1 – Gebäude
    gebaeudetyp: string;
    baujahr: string;
    // Step 2 – Bereiche
    bereiche: string[];
    // Step 3 – Kaufmotive
    kaufmotive: string[];
    // Step 4 – Pain Points
    painPoints: string[];
    // Step 5 – Budget & Timing
    budget: string;
    zeitplanung: string;
    // Step 6 – Kontakt
    vorname: string;
    nachname: string;
    email: string;
    telefon: string;
    plz: string;
    datenschutz: boolean;
}

const INITIAL_DATA: FormData = {
    gebaeudetyp: '',
    baujahr: '',
    bereiche: [],
    kaufmotive: [],
    painPoints: [],
    budget: '',
    zeitplanung: '',
    vorname: '',
    nachname: '',
    email: '',
    telefon: '',
    plz: '',
    datenschutz: false
};

// ─── Step meta ────────────────────────────────────────────────────────────────

const STEPS = [
    'Gebäudetyp',
    'Baujahr',
    'Ihre Wünsche',
    'Ihre Motive',
    'Ihre Herausforderungen',
    'Budget & Zeitplan',
    'Kontakt'
];

const STEP_BACKGROUNDS = [
    'linear-gradient(135deg, rgba(0,199,251,0.10) 0%, rgba(18,123,147,0.15) 50%, rgba(44,50,64,0.50) 100%)',
    'linear-gradient(145deg, rgba(18,123,147,0.12) 0%, rgba(0,199,251,0.12) 50%, rgba(44,50,64,0.52) 100%)',
    'linear-gradient(160deg, rgba(44,50,64,0.55) 0%, rgba(0,199,251,0.10) 55%, rgba(18,123,147,0.18) 100%)',
    'linear-gradient(120deg, rgba(18,123,147,0.18) 0%, rgba(44,50,64,0.50) 50%, rgba(0,199,251,0.08) 100%)',
    'linear-gradient(150deg, rgba(0,199,251,0.07) 0%, rgba(18,123,147,0.20) 50%, rgba(44,50,64,0.55) 100%)',
    'linear-gradient(135deg, rgba(44,50,64,0.55) 0%, rgba(0,199,251,0.12) 50%, rgba(18,123,147,0.20) 100%)',
    'linear-gradient(135deg, rgba(0,199,251,0.15) 0%, rgba(18,123,147,0.22) 50%, rgba(44,50,64,0.45) 100%)'
];

// ─── Helper: multi-select card ────────────────────────────────────────────────

interface OptionCardProps {
    label: string;
    icon?: string;
    selected: boolean;
    onClick: () => void;
    description?: string;
}

function OptionCard({ label, icon, selected, onClick, description }: OptionCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: selected ? '2px solid #00C7FB' : '2px solid rgba(255,255,255,0.15)',
                background: selected ? 'rgba(0,199,251,0.15)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                width: '100%',
                color: 'white'
            }}
        >
            {icon && <span style={{ fontSize: '2rem', lineHeight: 1 }}>{icon}</span>}
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{label}</span>
            {description && (
                <span style={{ fontSize: '0.8rem', opacity: 0.7, lineHeight: 1.3 }}>{description}</span>
            )}
        </button>
    );
}

// ─── Helper: single-select card ──────────────────────────────────────────────

interface SingleCardProps {
    label: string;
    icon?: string;
    value: string;
    selected: string;
    onSelect: (v: string) => void;
    description?: string;
}

function SingleCard({ label, icon, value, selected, onSelect, description }: SingleCardProps) {
    return (
        <OptionCard
            label={label}
            icon={icon}
            selected={selected === value}
            onClick={() => onSelect(value)}
            description={description}
        />
    );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
    current: number;
    total: number;
}

function ProgressBar({ current, total }: ProgressBarProps) {
    const pct = Math.round((current / total) * 100);
    return (
        <div style={{ marginBottom: '2rem' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    opacity: 0.7
                }}
            >
                <span>
                    Schritt {current + 1} von {total}
                </span>
                <span>{pct}% abgeschlossen</span>
            </div>
            <div
                style={{
                    height: '6px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #00C7FB, #127B93)',
                        borderRadius: '3px',
                        transition: 'width 0.4s ease'
                    }}
                />
            </div>
            <div
                style={{
                    marginTop: '0.75rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#00C7FB'
                }}
            >
                {STEPS[current]}
            </div>
        </div>
    );
}

// ─── Step 1: Gebäudetyp ───────────────────────────────────────────────────────

function Step1({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
    const gebaeudeTypes = [
        { value: 'einfamilienhaus', label: 'Einfamilienhaus', icon: '🏠' },
        { value: 'reihenhaus', label: 'Reihenhaus', icon: '🏘️' },
        { value: 'doppelhaus', label: 'Doppelhaus', icon: '🏡' },
        { value: 'wohnung', label: 'Eigentumswohnung', icon: '🏢' },
        { value: 'sonstiges', label: 'Sonstiges', icon: '🏗️' }
    ];
    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Erzählen Sie uns von Ihrem Gebäude</h2>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Diese Information hilft uns, die beste Smart Home-Lösung für Sie zu finden.
            </p>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Welcher Gebäudetyp trifft auf Sie zu?</p>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem'
                }}
            >
                {gebaeudeTypes.map((t) => (
                    <div
                        key={t.value}
                        style={t.value === 'sonstiges' ? { gridColumn: '1 / -1' } : undefined}
                    >
                        <SingleCard
                            value={t.value}
                            label={t.label}
                            icon={t.icon}
                            selected={data.gebaeudetyp}
                            onSelect={(v) => setData({ ...data, gebaeudetyp: v })}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Step 2: Baujahr ──────────────────────────────────────────────────────────

function StepBaujahr({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
    const baujahrTypes = [
        {
            value: 'neubau',
            label: 'Neubau',
            icon: '🏗️',
            description: 'Unter 3 Jahre alt / Im Bau'
        },
        {
            value: 'jung',
            label: 'Junggebäude',
            icon: '✨',
            description: '3–20 Jahre alt'
        },
        {
            value: 'bestand',
            label: 'Bestandsgebäude',
            icon: '🏚️',
            description: 'Älter als 20 Jahre'
        }
    ];
    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Wann wurde das Gebäude gebaut?</h2>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Diese Information hilft uns, die optimale Lösung für Ihr Zuhause zu empfehlen.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {baujahrTypes.map((t) => (
                    <SingleCard
                        key={t.value}
                        value={t.value}
                        label={t.label}
                        icon={t.icon}
                        description={t.description}
                        selected={data.baujahr}
                        onSelect={(v) => setData({ ...data, baujahr: v })}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Step 2: Bereiche ─────────────────────────────────────────────────────────

function Step2({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
    const options = [
        { value: 'beleuchtung', label: 'Beleuchtung & Ambience', icon: '💡' },
        { value: 'heizung', label: 'Heizung & Klima', icon: '🌡️' },
        { value: 'sicherheit', label: 'Sicherheit & Zugang', icon: '🔒' },
        { value: 'entertainment', label: 'Unterhaltung & Musik', icon: '🎵' },
        { value: 'energie', label: 'Energie & Photovoltaik', icon: '⚡' },
        { value: 'rolllaeden', label: 'Rollläden & Jalousien', icon: '🪟' },
        { value: 'garten', label: 'Garten & Bewässerung', icon: '🌿' },
        { value: 'sprachsteuerung', label: 'Sprachsteuerung', icon: '🎙️' }
    ];

    function toggle(val: string) {
        const next = data.bereiche.includes(val)
            ? data.bereiche.filter((x) => x !== val)
            : [...data.bereiche, val];
        setData({ ...data, bereiche: next });
    }

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Welche Bereiche interessieren Sie?</h2>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Wählen Sie alle Bereiche aus, die für Ihr Smart Home relevant sind. Mehrfachauswahl möglich.
            </p>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem'
                }}
            >
                {options.map((o) => (
                    <OptionCard
                        key={o.value}
                        label={o.label}
                        icon={o.icon}
                        selected={data.bereiche.includes(o.value)}
                        onClick={() => toggle(o.value)}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Step 3: Kaufmotive ───────────────────────────────────────────────────────

function Step3({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
    const options = [
        { value: 'energiesparen', label: 'Energiesparen & Kosten senken', icon: '💰' },
        { value: 'komfort', label: 'Mehr Wohnkomfort', icon: '🛋️' },
        { value: 'sicherheit', label: 'Mehr Sicherheit & Schutz', icon: '🛡️' },
        { value: 'investition', label: 'Wertsteigerung der Immobilie', icon: '📈' },
        { value: 'nachhaltigkeit', label: 'Nachhaltiger Leben', icon: '🌱' },
        { value: 'altersgerecht', label: 'Altersgerechtes Wohnen', icon: '👴' },
        { value: 'technologie', label: 'Faszination Technologie', icon: '🤖' },
        { value: 'fernsteuerung', label: 'Alles aus der Ferne steuern', icon: '📱' }
    ];

    function toggle(val: string) {
        const next = data.kaufmotive.includes(val)
            ? data.kaufmotive.filter((x) => x !== val)
            : [...data.kaufmotive, val];
        setData({ ...data, kaufmotive: next });
    }

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Was motiviert Sie?</h2>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Was sind Ihre wichtigsten Gründe für ein Smart Home? Mehrfachauswahl möglich.
            </p>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem'
                }}
            >
                {options.map((o) => (
                    <OptionCard
                        key={o.value}
                        label={o.label}
                        icon={o.icon}
                        selected={data.kaufmotive.includes(o.value)}
                        onClick={() => toggle(o.value)}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Step 4: Pain Points ──────────────────────────────────────────────────────

function Step4({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
    const options = [
        { value: 'hohe_kosten', label: 'Hohe Energiekosten', icon: '💸' },
        { value: 'kompliziert', label: 'Technik zu kompliziert', icon: '😤' },
        { value: 'sicherheit', label: 'Einbruchsangst / Unsicherheit', icon: '😰' },
        { value: 'veraltet', label: 'Veraltete Haussteuerung', icon: '📟' },
        { value: 'kein_komfort', label: 'Mangelnder Komfort', icon: '😒' },
        { value: 'keine_uebersicht', label: 'Kein Überblick über Verbrauch', icon: '📊' },
        { value: 'kein_einfluss', label: 'Kein Remote-Zugriff von unterwegs', icon: '🌍' },
        { value: 'wertminderung', label: 'Sorge um Immobilienwert', icon: '🏚️' }
    ];

    function toggle(val: string) {
        const next = data.painPoints.includes(val)
            ? data.painPoints.filter((x) => x !== val)
            : [...data.painPoints, val];
        setData({ ...data, painPoints: next });
    }

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Was nervt Sie aktuell am meisten?</h2>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Welche Herausforderungen möchten Sie mit Smart Home lösen? Mehrfachauswahl möglich.
            </p>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem'
                }}
            >
                {options.map((o) => (
                    <OptionCard
                        key={o.value}
                        label={o.label}
                        icon={o.icon}
                        selected={data.painPoints.includes(o.value)}
                        onClick={() => toggle(o.value)}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Step 5: Budget & Timing ──────────────────────────────────────────────────

function Step5({ data, setData }: { data: FormData; setData: (d: FormData) => void }) {
    const budgets = [
        { value: 'unter1000', label: 'Unter 1.000 €', icon: '💶', description: 'Einstieg' },
        { value: '1000bis5000', label: '1.000 – 5.000 €', icon: '💵', description: 'Starter-Paket' },
        { value: '5000bis15000', label: '5.000 – 15.000 €', icon: '💴', description: 'Vollausstattung' },
        { value: 'ueber15000', label: 'Über 15.000 €', icon: '💎', description: 'Premium / Komplett' }
    ];
    const zeiten = [
        { value: 'sofort', label: 'So bald wie möglich', icon: '⚡' },
        { value: '3_6monate', label: 'In 3–6 Monaten', icon: '📅' },
        { value: '6_12monate', label: 'In 6–12 Monaten', icon: '🗓️' },
        { value: 'offen', label: 'Noch unentschlossen', icon: '🤔' }
    ];
    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Budget & Zeitplanung</h2>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Ungefähre Angaben helfen uns, das passende Angebot für Sie zu erstellen.
            </p>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Ihr ungefähres Budget?</p>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    marginBottom: '1.5rem'
                }}
            >
                {budgets.map((b) => (
                    <SingleCard
                        key={b.value}
                        value={b.value}
                        label={b.label}
                        icon={b.icon}
                        description={b.description}
                        selected={data.budget}
                        onSelect={(v) => setData({ ...data, budget: v })}
                    />
                ))}
            </div>
            <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Wann möchten Sie starten?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {zeiten.map((z) => (
                    <SingleCard
                        key={z.value}
                        value={z.value}
                        label={z.label}
                        icon={z.icon}
                        selected={data.zeitplanung}
                        onSelect={(v) => setData({ ...data, zeitplanung: v })}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Step 6: Kontakt ──────────────────────────────────────────────────────────

interface Step6Props {
    data: FormData;
    setData: (d: FormData) => void;
    errors: Partial<Record<keyof FormData, string>>;
    clearError: (field: keyof FormData) => void;
}

function Step6({ data, setData, errors, clearError }: Step6Props) {
    const inputStyle = (field: keyof FormData): React.CSSProperties => ({
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: errors[field] ? '2px solid #f87171' : '2px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.07)',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box'
    });

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem' }}>Fast geschafft! Ihr persönliches Angebot</h2>
            <p style={{ opacity: 0.7, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Tragen Sie Ihre Kontaktdaten ein und wir senden Ihnen Ihre individuelle Smart Home-Empfehlung kostenlos
                zu.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', opacity: 0.8 }}>
                            Vorname
                        </label>
                        <input
                            style={inputStyle('vorname')}
                            type="text"
                            placeholder="Max"
                            value={data.vorname}
                            onChange={(e) => setData({ ...data, vorname: e.target.value })}
                            autoComplete="given-name"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', opacity: 0.8 }}>
                            Nachname
                        </label>
                        <input
                            style={inputStyle('nachname')}
                            type="text"
                            placeholder="Mustermann"
                            value={data.nachname}
                            onChange={(e) => setData({ ...data, nachname: e.target.value })}
                            autoComplete="family-name"
                        />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', opacity: 0.8 }}>
                        E-Mail-Adresse <span style={{ color: '#00C7FB' }}>*</span>
                    </label>
                    <input
                        style={inputStyle('email')}
                        type="email"
                        placeholder="max@beispiel.de"
                        value={data.email}
                        onChange={(e) => { setData({ ...data, email: e.target.value }); clearError('email'); }}
                        autoComplete="email"
                    />
                    {errors.email && (
                        <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.email}</p>
                    )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', opacity: 0.8 }}>
                            Telefon
                        </label>
                        <input
                            style={inputStyle('telefon')}
                            type="tel"
                            placeholder="+49 123 456789"
                            value={data.telefon}
                            onChange={(e) => setData({ ...data, telefon: e.target.value })}
                            autoComplete="tel"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', opacity: 0.8 }}>
                            Postleitzahl
                        </label>
                        <input
                            style={inputStyle('plz')}
                            type="text"
                            placeholder="12345"
                            maxLength={5}
                            value={data.plz}
                            onChange={(e) => setData({ ...data, plz: e.target.value })}
                            autoComplete="postal-code"
                        />
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '0.5rem',
                        border: errors.datenschutz ? '2px solid #f87171' : '2px solid transparent'
                    }}
                >
                    <input
                        id="datenschutz"
                        type="checkbox"
                        checked={data.datenschutz}
                        onChange={(e) => { setData({ ...data, datenschutz: e.target.checked }); clearError('datenschutz'); }}
                        style={{ marginTop: '0.15rem', accentColor: '#00C7FB', width: '1rem', height: '1rem', flexShrink: 0 }}
                    />
                    <label htmlFor="datenschutz" style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.5, cursor: 'pointer' }}>
                        Ich stimme zu, dass meine Daten zur Erstellung eines persönlichen Smart Home-Angebots verwendet
                        werden. Weitere Informationen in unserer{' '}
                        <a href="/datenschutz" style={{ color: '#00C7FB' }}>
                            Datenschutzerklärung
                        </a>
                        . <span style={{ color: '#00C7FB' }}>*</span>
                    </label>
                </div>
                {errors.datenschutz && (
                    <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '-0.5rem' }}>{errors.datenschutz}</p>
                )}
            </div>
        </div>
    );
}

// ─── Thank You screen ─────────────────────────────────────────────────────────

function ThankYou({ email }: { email: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
            <h2 style={{ marginBottom: '1rem', color: '#00C7FB' }}>Vielen Dank!</h2>
            <p style={{ opacity: 0.9, marginBottom: '0.75rem', fontSize: '1.05rem' }}>
                Wir haben Ihre Anfrage erhalten und werden Ihnen Ihr persönliches Smart Home-Konzept an{' '}
                <strong style={{ color: '#00C7FB' }}>{email}</strong> zusenden.
            </p>
            <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '0.9rem' }}>
                In der Regel melden wir uns innerhalb von 24 Stunden bei Ihnen.
            </p>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxWidth: '360px',
                    margin: '0 auto'
                }}
            >
                <div
                    style={{
                        padding: '1rem',
                        background: 'rgba(0,199,251,0.1)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0,199,251,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>📧</span>
                    <span>Bestätigungs-E-Mail wurde versendet</span>
                </div>
                <div
                    style={{
                        padding: '1rem',
                        background: 'rgba(0,199,251,0.1)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0,199,251,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>🏠</span>
                    <span>Ihr persönliches Konzept wird erstellt</span>
                </div>
                <div
                    style={{
                        padding: '1rem',
                        background: 'rgba(0,199,251,0.1)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0,199,251,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>📞</span>
                    <span>Unser Experte meldet sich innerhalb von 24 h</span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Konfigurator ────────────────────────────────────────────────────────

export default function SmartHomeKonfigurator() {
    const [step, setStep] = useState(0);
    const [prevStep, setPrevStep] = useState(0);
    const [direction, setDirection] = useState<'forward' | 'back'>('forward');
    const [data, setData] = useState<FormData>(INITIAL_DATA);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Refs so event listeners always see the latest values without re-registration
    const stepRef = useRef(step);
    stepRef.current = step;
    const submittedRef = useRef(submitted);
    submittedRef.current = submitted;

    // Notify on configurator open.
    // Use an AbortController so that React Strict Mode's extra mount/unmount cycle
    // cancels the first (spurious) fetch while the second (real) mount fires correctly.
    // This also means every genuine page load sends the notification.
    useEffect(() => {
        const controller = new AbortController();
        fetch('/api/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'configurator_opened' }),
            signal: controller.signal
        }).catch((err) => {
            if (err.name !== 'AbortError') {
                console.error('[configurator] Failed to send opened event:', err);
            }
        });
        return () => controller.abort();
    }, []);

    // Notify when user leaves without submitting
    useEffect(() => {
        function handleBeforeUnload() {
            if (!submittedRef.current) {
                const payload = JSON.stringify({
                    type: 'configurator_abandoned',
                    step: stepRef.current,
                    stepName: STEPS[stepRef.current]
                });
                navigator.sendBeacon('/api/event', new Blob([payload], { type: 'application/json' }));
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    function clearError(field: keyof FormData) {
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    const totalSteps = STEPS.length;

    function validate(): boolean {
        if (step === 6) {
            const newErrors: Partial<Record<keyof FormData, string>> = {};
            if (!data.email.trim()) {
                newErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
            } else if (!EMAIL_REGEX.test(data.email)) {
                newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
            }
            if (!data.datenschutz) {
                newErrors.datenschutz = 'Bitte stimmen Sie der Datenschutzerklärung zu.';
            }
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }
        return true;
    }

    function canProceed(): boolean {
        if (step === 0) return data.gebaeudetyp !== '';
        if (step === 1) return data.baujahr !== '';
        if (step === 2) return data.bereiche.length > 0;
        if (step === 3) return data.kaufmotive.length > 0;
        if (step === 4) return data.painPoints.length > 0;
        if (step === 5) return data.budget !== '' && data.zeitplanung !== '';
        return true;
    }

    async function handleNext() {
        if (!validate()) return;
        if (step < totalSteps - 1) {
            setDirection('forward');
            setPrevStep(step);
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Submit
            setSubmitting(true);
            setSubmitError(null);
            try {
                const res = await fetch('/api/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error((body as { error?: string }).error ?? 'Fehler beim Senden');
                }
                setDirection('forward');
                setPrevStep(step);
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                setSubmitError(
                    err instanceof Error
                        ? err.message
                        : 'Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
                );
            } finally {
                setSubmitting(false);
            }
        }
    }

    function handleBack() {
        if (step > 0) {
            setDirection('back');
            setPrevStep(step);
            setStep(step - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    const btnBase: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.875rem 1.5rem',
        borderRadius: '0.5rem',
        border: 'none',
        fontWeight: 700,
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const btnPrimary: React.CSSProperties = {
        ...btnBase,
        background: 'linear-gradient(135deg, #00C7FB, #127B93)',
        color: 'white',
        flex: 1
    };

    const btnSecondary: React.CSSProperties = {
        ...btnBase,
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        flex: 1
    };

    if (submitted) {
        const thankYouBg = STEP_BACKGROUNDS[STEP_BACKGROUNDS.length - 1];
        return (
            <div
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: STEP_BACKGROUNDS[prevStep],
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '680px',
                    margin: '0 auto',
                    border: '1px solid rgba(0,199,251,0.25)',
                    boxShadow: '0 0 40px rgba(0,199,251,0.08), inset 0 1px 0 rgba(0,199,251,0.1)',
                    backdropFilter: 'blur(8px)'
                }}
            >
                {/* Fade-in overlay for the final background */}
                <div
                    key="submitted"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: thankYouBg,
                        animation: 'bgFadeIn 0.5s ease forwards',
                        zIndex: 0
                    }}
                />
                <div style={{ position: 'relative', zIndex: 1, animation: 'stepSlideInRight 0.35s ease forwards' }}>
                    <ThankYou email={data.email} />
                </div>
            </div>
        );
    }

    const slideAnim = direction === 'forward' ? 'stepSlideInRight 0.35s ease forwards' : 'stepSlideInLeft 0.35s ease forwards';

    return (
        <div
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: STEP_BACKGROUNDS[prevStep],
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '680px',
                margin: '0 auto',
                border: '1px solid rgba(0,199,251,0.20)',
                boxShadow: '0 0 40px rgba(0,199,251,0.08), inset 0 1px 0 rgba(0,199,251,0.1)',
                backdropFilter: 'blur(8px)'
            }}
        >
            {/* Background overlay: fades in the new step gradient */}
            <div
                key={step}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: STEP_BACKGROUNDS[step],
                    animation: 'bgFadeIn 0.5s ease forwards',
                    zIndex: 0
                }}
            />

            {/* All content sits above the background overlay */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <ProgressBar current={step} total={totalSteps} />

                {/* Step content slides in on each step change */}
                <div key={step} style={{ minHeight: '340px', animation: slideAnim }}>
                    {step === 0 && <Step1 data={data} setData={setData} />}
                    {step === 1 && <StepBaujahr data={data} setData={setData} />}
                    {step === 2 && <Step2 data={data} setData={setData} />}
                    {step === 3 && <Step3 data={data} setData={setData} />}
                    {step === 4 && <Step4 data={data} setData={setData} />}
                    {step === 5 && <Step5 data={data} setData={setData} />}
                    {step === 6 && <Step6 data={data} setData={setData} errors={errors} clearError={clearError} />}
                </div>

                {submitError && (
                    <div
                        style={{
                            marginTop: '1rem',
                            padding: '0.75rem 1rem',
                            background: 'rgba(248,113,113,0.15)',
                            border: '1px solid rgba(248,113,113,0.4)',
                            borderRadius: '0.5rem',
                            color: '#fca5a5',
                            fontSize: '0.9rem'
                        }}
                    >
                        ⚠️ {submitError}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                    {step > 0 && (
                        <button style={btnSecondary} onClick={handleBack} disabled={submitting}>
                            ← Zurück
                        </button>
                    )}
                    <button
                        style={{
                            ...btnPrimary,
                            opacity: (!canProceed() || submitting) ? 0.6 : 1,
                            cursor: (!canProceed() || submitting) ? 'not-allowed' : 'pointer'
                        }}
                        onClick={handleNext}
                        disabled={!canProceed() || submitting}
                    >
                        {submitting
                            ? '⏳ Wird gesendet…'
                            : step === totalSteps - 1
                              ? '✉️ Kostenloses Angebot anfordern'
                              : 'Weiter →'}
                    </button>
                </div>

                {!canProceed() && (
                    <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.8rem', marginTop: '0.75rem' }}>
                        {step === 2 || step === 3 || step === 4
                            ? 'Bitte wählen Sie mindestens eine Option aus.'
                            : 'Bitte füllen Sie alle Pflichtfelder aus.'}
                    </p>
                )}
            </div>
        </div>
    );
}
