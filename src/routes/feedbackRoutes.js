const router = require('express').Router();
const fs = require('fs/promises');
const path = require('path');

const SUPPORTED = ['en', 'fr'];                      // whitelist: also blocks path tricks like ?lang=../../x
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

router.get('/', async (req, res, next) => {
  try {
    const lang = SUPPORTED.includes(req.query.lang) ? req.query.lang : 'en';
    const text = JSON.parse(await fs.readFile(path.join(__dirname, '..', '..', 'locales', `${lang}.json`), 'utf8'));
    const today = new Intl.DateTimeFormat(lang, { dateStyle: 'full' }).format(new Date());

    const questions = text.questions.map((q, i) =>
  `<label>${i + 1}. ${escapeHtml(q)}<br><textarea rows="4" cols="70" name="q${i + 1}">${escapeHtml((text.answers && text.answers[i]) || '')}</textarea></label><br><br>`).join('');
    res.send(`<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8">
      <title>${escapeHtml(text.title)}</title></head><body>
      <p><a href="?lang=en">English</a> | <a href="?lang=fr">Français</a></p>
      <h1>${escapeHtml(text.title)}</h1><p>${escapeHtml(text.instructions)}</p>
      <p>${escapeHtml(text.dateLabel)}: ${today}</p>
      <form>${questions}</form></body></html>`);
  } catch (e) { next(e); }
});
module.exports = router;