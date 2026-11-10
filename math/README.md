# מעבדת המתמטיקה (`math/`)

אפליקציה נפרדת לאילי (כיתה ט'): כמה דקות ביום של שאלות אמריקאיות שבודקות **הבנה**, לא חישוב על דף.
כתובת: `.../vocab-app/math/`. אין לה שום קשר לאפליקציות האנגלית: הנתונים נשמרים רק במכשיר (localStorage, מפתח `math-lab-v1`), בלי Firebase, ועם manifest ו-service worker משלה.

## קבצים
- `index.html`, `style.css`, `app.js`: האפליקציה (מסך בית, סבב, סוף סבב, גביעים, דף חוקים, סקירת מצב).
- `lib.js`: עזרים לכתיבת שאלות: `M()` לנוסחה בתוך טקסט עברי, `R` לאקראיות, `choices()`, ו-`D` לשרטוטי SVG.
- `topics/*.js`: נושא בכל קובץ. כרגע `geometry.js` (משפטי גאומטריה, חוברת ארכימדס נושא 10) ו-`algebra.js` (פירוק לגורמים ונוסחאות הכפל המקוצר).

## הוספת נושא
1. קובץ חדש `topics/<id>.js` שמוסיף ל-`TOPICS` אובייקט `{ id, title, icon, added: 'YYYY-MM-DD', blurb, subs, rules, templates }`.
2. כל template: `{ id, sub, lvl?, make(level) }` (הפורמטים המדויקים בראש `lib.js`): שאלה אמריקאית או נכון/לא נכון (`opts`, הראשונה נכונה), "גע בשרטוט" (`tap` + מטרות `D.hitSeg`/`D.hitAng`), או סידור שלבים (`steps` בסדר הנכון, ו-`groups` לשלבים שאפשר להחליף ביניהם).
3. להוסיף `<script>` ב-`index.html` ואת הקובץ ל-`SHELL` ב-`sw.js` (ולהעלות את מספר הגרסה ב-`CACHE`).
4. הנושא עם התאריך `added` החדש ביותר מקבל תגית "חדש" לעשרה ימים.

## איך זה עובד
- סבב = 8 שאלות. הסבב הראשון ביום משלים את המשימה היומית (רצף 🔥, +3 ⭐).
- טעות: מוצג הסבר והחוק, והשאלה חוזרת (עם מספרים חדשים) בסוף הסבב.
- כוכב לכל תשובה נכונה בניסיון ראשון בלי רמז, בונוס כל 5 ברצף, +5 על סבב מושלם. דרגות לפי כוכבים, 20 גביעים.
- חזרה מרווחת (Leitner) לכל סוג שאלה: 0, 1, 2, 4, 8, 16, 32 ימים. "נרכש" = קופסה 3 ומעלה.
- "כל החומר מעורבב": כל הנושאים, עד 2 שאלות מכל תת-נושא, ושאלות שכבר נרכשו חוזרות לעתים כתזכורת.
- רמות קושי: לכל תת-נושא 3 רמות. 7 נכונות מתוך 8 האחרונות (ניסיון ראשון, בלי רמז) מעלות רמה (+5 ⭐), ונפתחות שאלות עם `lvl` גבוה יותר: מספרים קשים יותר, "מה הצעד הראשון", סידור שלבי פתרון והוכחה, ומציאת טעות.
- תמיד אפשר להמשיך לעוד סבבים, וכל סבב נותן כוכבים.
- "לחזק נקודות חלשות" מופיע כשיש תת-נושאים עם נכונות נמוכה.
- מגן רצף כל 7 ימים ברצף (עד 2), מכסה יום שהוחמץ.
- סקירת מצב: רצף, לוח 4 שבועות, התקדמות לכל נושא, תת-נושאים לפי "שולט / צריך עוד תרגול / בתהליך / עוד לא תורגל", טעויות אחרונות.

## Step-by-step exercises and coins (2026-11-10)
- `topics/chains.js` adds "תרגיל בשלבים" templates to the algebra and geometry topics: a real exercise with fresh numbers,
  solved in multiple-choice steps; each step's `after` updates the expression box. Up to `CHAINS` (5) of the 8 questions
  in a round are chains.
- Coins (`S.coins`): 1 per right step, +3 for a whole exercise with no mistake, 2 per quick question, round bonuses,
  a daily visit bonus that grows with the streak, and milestones at 10/25/50/100 steps a day. Everything is multiplied by the
  streak bonus (×1.1 per day in a row, up to ×2). The wallet screen has a small shop (streak shield, colour themes, and a
  "prize from the parents" that is logged in `S.redeems` and shown on the status screen).
