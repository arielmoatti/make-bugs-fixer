<div dir="rtl">

# תוסף Make Bugs Fixer - תיקוני קהילה ל-Make.com

<p align="center"><img src="icons/128.png" width="96" alt="Make Bugs Fixer"></p>

מדובר בתוסף Chrome קטן וקוד-פתוח שמתקן שני מטרדים ש-Make.com עדיין לא פתרו: רינדור הפונט העברי המכוער, והשינוי שהעביר את גרירת הקאנבס מהכפתור השמאלי לכפתור הימני. כל אחד מהתיקונים ניתן להדלקה או כיבוי בנפרד, בקליק ימני על אייקון התוסף.

<blockquote dir="rtl">
תוסף קהילתי לא רשמי. אינו מזוהה עם Make או מסונף אליו בשום צורה. השם "Make" מופיע לתיאור בלבד.
</blockquote>

## מה הוא מתקן

<ul dir="rtl">
<li><b>פונט עברי</b> - Make ו-Boost.space מרנדרים עברית בפונט שבור. התוסף כופה Segoe UI על כל טקסט עברי. רץ על <code>make.com</code> וגם על <code>boost.space</code>.</li>
<li><b>גרירה בכפתור שמאלי (Make בלבד)</b> - בעורך הסצנות החדש Make העבירו את הזזת הקאנבס (pan) לכפתור הימני. התוסף מחזיר את הגרירה בכפתור השמאלי על אזור ריק, בלי לפגוע בהזזת מודולים.</li>
</ul>

## התקנה

<blockquote dir="rtl">
<b>הורדה מהירה:</b> קובץ ZIP מוכן יושב ב-<a href="https://github.com/arielmoatti/make-bugs-fixer/releases/latest">Releases</a> (מופיע גם בצד ימין של עמוד הריפו). הורידו אותו, חלצו, והמשיכו משלב 2.
</blockquote>

<ol dir="rtl">
<li>הורידו את הקוד: לחצו על הכפתור הירוק <code>Code &lt;&gt;</code> ואז <b>Download ZIP</b>, וחלצו לתיקייה. (אפשר גם להוריד מה-<b>Release</b>.)</li>
<li>פתחו בכרום את <code>chrome://extensions</code>.</li>
<li>הדליקו <b>Developer mode</b> (פינה ימנית עליונה).</li>
<li>לחצו <b>Load unpacked</b> ובחרו את התיקייה שחילצתם (זו שמכילה את <code>manifest.json</code>).</li>
<li>פתחו או רעננו טאב של Make. זהו.</li>
</ol>

## הדלקה וכיבוי (Toggle)

קליק ימני על אייקון התוסף ← שני סימוני וי:

<ul dir="rtl">
<li><b>Hebrew font fix</b> - תיקון הפונט העברי.</li>
<li><b>Left-drag pan (canvas)</b> - גרירה שמאלית לקאנבס.</li>
</ul>

הגרירה השמאלית מתחלפת מיידית. תיקון הפונט חל במלואו אחרי רענון הדף.

## איך הגרירה עובדת (לסקרנים)

העורך החדש מצייר את כל הסצנה על אלמנט <code>canvas</code> יחיד, וה-pan מופעל על ידי pointer events עם כפתור ימני. כשמתחילים גרירה שמאלית על רקע ריק, התוסף זורק אירוע <code>pointerdown</code> ימני סינתטי שמשתמש ב-pointerId האמיתי של העכבר. כך מנגנון ה-pan המקורי של Make רץ על התנועות האמיתיות שלך. גרירה על מודול לא מושפעת.

## סייגים

<ul dir="rtl">
<li>זיהוי "רקע ריק מול מודול" מבוסס דגימת פיקסלים. גרירה שמתחילה בדיוק על קו צבעוני באוויר עלולה לא להיתפס כריקה.</li>
<li>אם Make ישנו שוב את מבנה הקאנבס, ייתכן שהתוסף יצטרך עדכון.</li>
</ul>

## רישיון

&rlm;MIT - ראו <a href="LICENSE">LICENSE</a>.

<details>
<summary>English summary</summary>

<div dir="ltr">

**Make Bugs Fixer** is a small, unofficial community Chrome extension that fixes two annoyances Make.com hasn't: ugly Hebrew font rendering (on Make + Boost.space), and the new canvas that moved panning from left-drag to right-drag.

It restores left-click drag to pan (Make only) by dispatching a synthetic right-button `pointerdown` that reuses the **real** pointerId, so Make's native pan runs on the real mouse moves; dragging modules is unaffected. Each fix can be toggled independently via **right-click on the extension icon**.

**Install:** download/clone → `chrome://extensions` → enable Developer mode → **Load unpacked** → pick the folder. Not affiliated with Make.

</div>

</details>

</div>
