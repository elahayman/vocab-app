// Sends the daily reminder to every phone that turned it on (families/{code}/data/push~{uid}).
// Runs every hour from .github/workflows/reminders.yml. A phone gets at most one reminder a day,
// at or after the hour it chose (Israel time), and none once its player finished today's mission.
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldPath } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const TZ = 'Asia/Jerusalem';
const LAST_HOUR = 21; // a reminder that is late (GitHub delays scheduled runs) is dropped after this hour
const APP_URL = 'https://elahayman.github.io/vocab-app/index.html';

initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = getFirestore();
const messaging = getMessaging();

// The same day number as todayNum() in app.js, for the date in Israel.
const now = new Date();
const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
}).formatToParts(now).map((x) => [x.type, x.value]));
const day = Math.floor(Date.UTC(+parts.year, +parts.month - 1, +parts.day) / 86400000);
const hour = +parts.hour;
console.log(`Israel day ${day}, hour ${hour}`);

function message(p) {
  const lost = p.lastSessionDay != null && p.lastSessionDay < day - 1 - (p.shields || 0);
  const streak = lost ? 0 : p.streak || 0;
  return streak
    ? { title: `🔥 יום ${streak + 1} ברצף מחכה לך`, body: `${p.name}, כמה דקות של מילים והרצף ממשיך!` }
    : { title: '🦸 המשימה של היום מחכה לך', body: `${p.name}, כמה דקות של מילים ועוד לבנים לעיר!` };
}

let sent = 0;
for (const fam of await db.collection('families').listDocuments()) {
  const pushes = await fam.collection('data')
    .where(FieldPath.documentId(), '>=', 'push~').where(FieldPath.documentId(), '<', 'push~').get();
  for (const doc of pushes.docs) {
    const r = doc.data();
    if (r.lastSent === day || hour < r.hour || hour > LAST_HOUR) continue;
    const snap = await fam.collection('profiles').doc(r.profileId).get();
    if (!snap.exists) { await doc.ref.delete(); continue; } // the player was deleted
    const p = JSON.parse(snap.data().json);
    if (p.lastSessionDay === day) continue; // already done today
    try {
      await messaging.send({
        token: r.token,
        data: { ...message(p), url: APP_URL },
        webpush: { headers: { Urgency: 'high', TTL: String(3 * 3600) } },
      });
      await doc.ref.update({ lastSent: day });
      sent++;
    } catch (e) {
      console.log(`${fam.id}/${doc.id}: ${e.code}`);
      // The phone turned notifications off or the app was removed.
      if (e.code === 'messaging/registration-token-not-registered' || e.code === 'messaging/invalid-argument') {
        await doc.ref.delete();
      }
    }
  }
}
console.log(`Sent ${sent} reminder(s)`);
