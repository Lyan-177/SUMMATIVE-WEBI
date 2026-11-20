require('dotenv').config();
const express = require('express');
const os = require('os');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req,res, next) => {
    res.setHeader('X-Served-By', os.hostname());
    next();
})
app.get('/api/search', async (req,res) => {
    const q = String(req.query.q || '').trim();
    if (!/^[A-Za-z0-9 \-]{2,60}$/.test(q)) {
        return res.status(400).json({ error: `Enter a drug name (2-60 letters or numbers).`});
    }
    const url = new URL('https://api.fda.gov/drug/label.json');
    url.searchParams.set('search', 'openfda.brand_name:"${q}" openfda.generic_name."${q}"');
    url.searchParams.set('limit','25');
    url.searchParams.set('api_key', process.env.OPENFDA_API_KEY);
    try {
        const r = await fetch(url);
        if (r.status === 404) return res.json([]);
        if (!r.ok) return res.status(502).json({ error: `FDA service error (${r.status}). Try again later.` });
        const data = await r.json();
        res.json(data.results.map((d) => ({
            brand: d.openfda?.brand_name?.[0] || 'Unnamed product' ,
            generic: d.openfda?.generic_name?.[0] || '',
            manufacturer: d.openfda?.manufacturer_name?.[0] || '',
            boxed: !!d.boxed_warning,
            uses: (d.indications_and_usage?.[0] || '').slice(0,400),
            warnings: (d.warnings?.[0] || d.warnings_and_cautions?.[0] || '').slice(0,600),
            interactions: (d.drug_interactions?.[0] || '').slice(0,600)

        })))
    } catch {
        res.status(504).json({ error: 'Could not reach the FDA service.'});
    }
});
app.get('/health', (req,res) => res.json({status: 'ok', server: os.hostname()}));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
