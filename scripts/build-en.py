#!/usr/bin/env python3
"""Generate the English pages (/en/…) from the Hebrew sources.

    python3 scripts/build-en.py

Every visible Hebrew string in index.html, menu/index.html and jobs/index.html
must have an entry in T below; the script fails loudly if any Hebrew is left.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Hebrew → English. Longest keys are applied first so partial matches can't clobber.
T = {
    # ---- shared / head ----
    "VICO | מסעדה איטלקית כשרה בהרצליה – פיצה, פסטה ויין": "VICO | Kosher Italian Restaurant in Herzliya – Pizza, Pasta & Wine",
    "VICO היא האיטלקייה השכונתית בהרצליה. פיצות מהטאבון, פסטה טרייה, מנות לחלוקה, יין וקוקטיילים. ישיבה במקום וטייק אוויי.": "VICO is Herzliya's neighborhood Italian: wood-fired pizza, fresh pasta, plates to share, wine and cocktails. Eat in or take away.",
    "מסעדה איטלקית כשרה בהרצליה — פיצות מהטאבון, פסטה טרייה, מנות לחלוקה, יין וקוקטיילים. ישיבה במקום וטייק אוויי.": "Kosher Italian restaurant in Herzliya — wood-fired pizza, fresh pasta, plates to share, wine and cocktails. Eat in or take away.",
    "VICO | האיטלקייה השכונתית בהרצליה": "VICO | Herzliya's Neighborhood Italian",
    "פיצה מהטאבון, פסטה טרייה ויין טוב. ישיבה במקום וטייק אוויי. כשר.": "Wood-fired pizza, fresh pasta and good wine. Eat in or take away. Kosher.",
    "VICO האיטלקייה השכונתית": "VICO – The Neighborhood Italian",
    "אבן עזרא 17, הרצליה": "17 Even Ezra St., Herzliya",
    "אבן עזרא 17": "17 Even Ezra St.",
    "הרצליה": "Herzliya",
    "VICO — האיטלקייה השכונתית שלכם": "VICO — your neighborhood Italian",

    # ---- hero ----
    "פיצה · פסטה · יין": "Pizza · Pasta · Wine",
    "האיטלקייה<br>השכונתית שלכם.": "Your neighborhood<br>Italian.",
    "עבודת יד, טאבון חם ושולחן שכיף להישאר סביבו.": "Handmade, wood-fired, and a table you won't want to leave.",
    "הזמינו עכשיו": "Order now",
    "לתפריט המלא": "Full menu",
    "לתפריט הבר": "Bar menu",
    "לתפריט": "See the menu",

    # ---- dishes ----
    "מה אוכלים היום?": "What's cooking?",
    "משהו טוב מחכה על השולחן.": "There's always something good on the table.",
    "פסטה שחורה עם פטריות ושמן כמהין": "Black pasta with mushrooms and truffle oil",
    "פסטה טרייה שחורה, שמנת, פטריות, פרמזן ושמן כמהין": "Fresh black pasta, cream, mushrooms, parmesan and truffle oil",
    "פסטה שחורה": "Black Pasta",
    "ארנצ׳יני ברוטב רוזה": "Arancini in rosa sauce",
    "שלושה ארנצ׳יני, רוטב רוזה, פרמזן ועשבי תיבול": "Three arancini, rosa sauce, parmesan and herbs",
    "ארנצ׳יני רוזה": "Arancini Rosa",
    "פיצה חריפה עם רוקט וצ׳ילי": "Spicy pizza with arugula and chili",
    "רוטב עגבניות, מוצרלה, צ׳ילי וחלפיניו, שום קונפי ורוקט": "Tomato sauce, mozzarella, chili and jalapeño, garlic confit and arugula",
    "פיצה חריפה": "Spicy Pizza",
    "פסטה ירוקים וריקוטה": "Greens & ricotta pasta",
    "פסטה טרייה, כרשה, שעועית ירוקה, תרד, ריקוטה, פרמזן ולימון": "Fresh pasta, leek, green beans, spinach, ricotta, parmesan and lemon",
    "ירוקים וריקוטה": "Greens & Ricotta",
    "פיצת בצלים": "Onion pizza",
    "קרם בצל, מוצרלה, בצל ירוק, בצל מוחמץ ובצל פריך": "Onion cream, mozzarella, spring onion, pickled onion and crispy onion",
    "פיצה בצלים": "Onion Pizza",
    "לבבות חסה, קרוטונים, פרמזן ורוטב קיסר": "Baby lettuce, croutons, parmesan and Caesar dressing",
    "סלט קיסר": "Caesar Salad",
    "סוכריות סלק — קרפצ׳יו סלק ממולא גבינת עזים": "Beet candies — beet carpaccio filled with goat cheese",
    "קרפצ׳יו סלק ממולא גבינת עזים, בליווי רוקט ובלסמי": "Beet carpaccio filled with goat cheese, with arugula and balsamic",
    "סוכריות סלק": "Beet Candies",
    "ניוקי תפוח אדמה, שמנת וגורגונזולה": "Potato gnocchi, cream and gorgonzola",
    "ניוקי גורגונזולה": "Gorgonzola Gnocchi",

    # ---- takeaway ----
    "VICO אצלכם בבית.": "VICO at home.",
    "פיצה מהטאבון, פסטה טרייה, סלטים וכל מה שטוב ליד — אורזים חם ומחכים לכם באבן עזרא 17.": "Wood-fired pizza, fresh pasta, salads and everything that goes with them — packed hot and ready for pickup at 17 Even Ezra.",
    "הזמנה אונליין בלבד": "Online ordering only",
    "איסוף מהמסעדה": "Collect at the restaurant",
    "מוגש בחום ואהבה": "Served hot, with love",
    "להזמנה אונליין": "Order online",
    "שאלות, הזמנת מקום, קבוצות או אירוע?": "Questions, reservations, groups or private events?",

    # ---- atmosphere ----
    "אצל VICO": "At VICO",
    "באים לפיצה,<br>נשארים לעוד כוס.": "Come for the pizza,<br>stay for another glass.",
    "VICO היא האיטלקייה של השכונה. מקום לקפוץ אליו למשולש, לפתוח שולחן עם פסטה ופיצה, או להישאר לעוד בקבוק יין בערב. מהצהריים עם הילדים ועד הלילה בטרסה.": "VICO is the neighborhood's Italian — the place to grab a slice, share a table of pasta and pizza, or linger over one more bottle of wine. From lunch with the kids to late nights on the terrace.",
    "גלריית VICO": "VICO gallery",

    # ---- bar ----
    "כוס יין. קוקטייל. ועוד אחד.": "A glass of wine. A cocktail. And then one more.",
    "יינות ישראליים בכוס או בבקבוק, בירה קרה מהבקבוק וארבעה קוקטיילים שהבר שלנו רוקח בכל ערב. הטרסה מחכה.": "Israeli wines by the glass or bottle, ice-cold beer, and four house cocktails our bartenders shake every evening. The terrace is waiting.",
    "מוני שסק · אדיר בראש בלאן": "Mony Shesek · Adir Blush Blanc",
    "מוני פטיט ורדו · אדיר קברנה סוביניון · דרימיה סהר · אדיר פטיט סירה": "Mony Petit Verdot · Adir Cabernet Sauvignon · Drimia Sahar · Adir Petite Sirah",
    "מוני קלאדוק · אדיר רוזה": "Mony Caladoc · Adir Rosé",
    "טקילה בצ׳ילי, פסיפלורה והדרים. טרופי, חמצמץ עם קיק חריף!": "Chili-infused tequila, passion fruit and citrus. Tropical and tangy, with a spicy kick!",
    "טקילה בצ׳ילי, פסיפלורה והדרים. טרופי, חמצמץ עם קיק חריף": "Chili-infused tequila, passion fruit and citrus. Tropical and tangy, with a spicy kick",
    "וודקה, סמבוק, ענבי מרלו ולימון. פרחוני, פירותי ומרענן": "Vodka, elderflower, Merlot grapes and lemon. Floral, fruity and refreshing.",
    "ג׳ין וסאקה, דובדבן, יוזו ולימון. פירותי, חמצמץ ורענן": "Gin and sake, cherry, yuzu and lemon. Fruity, tart and crisp.",
    "ג׳ין, קמפרי והדרים. מריר, הדרי ומאוזן": "Gin, Campari and citrus. Bitter, zesty and balanced.",
    "זיכרונות מיפן": "Japanese Memories",

    # ---- tonight ----
    "היום ב־VICO": "Today at VICO",
    "הערב ב־VICO": "Tonight at VICO",
    "— מרגריטה, חריפה, יוונית, בצלים ושחורה": "— Margherita, Spicy, Greek, Onion and Black",
    "— מהקלאסית ועד ניוקי גורגונזולה": "— from the Classic to gorgonzola gnocchi",
    "— מנות ילדים עם ירקות ושתייה": "— kids’ plates with veggies and a drink",
    "— FUOCO!, La Dolce Vita, זיכרונות מיפן ו־Amaro Amore": "— FUOCO!, La Dolce Vita, Japanese Memories and Amaro Amore",
    "— מוני ואדיר בכוס או בבקבוק, ובירה קרה ליד": "— Mony and Adir by the glass or bottle, or an ice-cold beer",
    "— הפוקאצ׳ה של VICO, זוקיני נענע וארנצ׳יני רוזה": "— VICO’s focaccia, mint zucchini and arancini rosa",
    "אנטיפסטי לחלוקה": "Antipasti to share",
    "פיצה מהטאבון": "Wood-fired pizza",
    "פסטה טרייה": "Fresh pasta",
    "קוקטיילים": "Cocktails",

    # ---- club ----
    "כבר חברים?": "Friends get perks.",
    "הצטרפו למועדון החברים שלנו וקבלו הטבות, פינוקים ועדכונים על כל מה שקורה אצלנו.": "Join VICO's Friends for member perks, treats and first word on what's new.",
    "מתנת הצטרפות": "Welcome gift",
    "10% הנחה בהזמנה הראשונה": "10% off your first order",
    "מתנת יום הולדת": "Birthday gift",
    "קינוח מתנה לבחירה": "Dessert on us",
    "מתנת יום נישואין": "Anniversary gift",
    "2 כוסות יין הבית / בירה מהחבית": "Two glasses of house wine or draft beer",
    "ובנוסף צבירת נקודות בכל הזמנה למימוש בהזמנות הבאות.": "Plus points on every order, to spend on the next one.",
    "הצטרפו למועדון": "Join the club",
    "תקנון המועדון": "Club terms",
    "מדיניות פרטיות": "Privacy policy",

    # ---- visit ----
    "נתראה בשכונה.": "See you in the neighborhood.",
    "להזמנת מקום, קבוצות ואירועים": "Reservations, groups and private events",
    "כשר בהשגחת רבנות הרצליה": "Kosher, under the supervision of the Herzliya Rabbinate",
    "חניון המתחם (אבן עזרא 17) · חניון תיכון בן גוריון (אבן עזרא 15)": "On-site lot (17 Even Ezra) · Ben Gurion High School lot (15 Even Ezra)",
    "ניווט ב־Waze": "Navigate with Waze",
    "הזמנת מקום": "Book a table",
    "Takeaway אונליין": "Order takeaway",
    "פתיחת המיקום במפות Google": "Open the location in Google Maps",
    "מפה מאוירת: VICO באבן עזרא 17, הרצליה, עם סימון חניונים סמוכים": "Illustrated map: VICO at 17 Even Ezra, Herzliya, with nearby parking",
    "פתיחה במפות ←": "Open in Maps →",
    "א׳–ה׳ 12:00–23:00": "Sun–Thu 12:00–23:00",
    "כתובת": "Address",
    "שעות": "Hours",
    "טלפון": "Phone",
    "כשרות": "Kosher",
    "חניה": "Parking",

    # ---- instagram ----
    "VICO באינסטגרם": "VICO on Instagram",
    "מהשכונה": "Around the neighborhood",

    # ---- wine groups ----
    "לבן": "White",
    "אדום": "Red",
    "רוזה": "Rosé",
    "יין": "Wine",

    # ---- menu page ----
    "התפריט | VICO – פיצה מהטאבון, פסטה טרייה, יין וקוקטיילים בהרצליה": "Menu | VICO – Wood-fired Pizza, Fresh Pasta, Wine & Cocktails in Herzliya",
    "התפריט המלא של VICO בהרצליה: אנטיפסטי, סלטים, פיצות מהטאבון, פסטה טרייה, מנות ילדים, קינוחים, יין, קוקטיילים ובירה. כשר. ישיבה במקום או טייק אוויי.": "The full VICO menu: antipasti, salads, wood-fired pizza, fresh pasta, kids' plates, desserts, wine, cocktails and beer. Kosher. Eat in or take away.",
    "התפריט של VICO": "The VICO Menu",
    "פיצות מהטאבון, פסטה טרייה, אנטיפסטי, יין וקוקטיילים. כשר.": "Wood-fired pizza, fresh pasta, antipasti, wine and cocktails. Kosher.",
    "תפריט VICO": "VICO Menu",
    "פיצה · פסטה · יין ✦ כשר ✦ אבן עזרא 17, הרצליה": "Pizza · Pasta · Wine ✦ Kosher ✦ 17 Even Ezra St., Herzliya",
    "יושבים אצלנו?": "Dining in?",
    "זה התפריט. בוחרים, מזמינים מהצוות, ונשארים כמה שבא לכם.": "Here's the menu. Pick what you like, order with the team, and stay as long as you please.",
    "איך מגיעים": "Directions",
    "רעבים בבית?": "Hungry at home?",
    "כל המנות זמינות גם ל־Takeaway. מזמינים אונליין, אוספים חם.": "Everything on the menu is available to go. Order online, pick up hot.",
    "להזמנה ←": "Order →",
    "קטגוריות תפריט": "Menu categories",
    "ראשונות": "Starters",
    "סלטים": "Salads",
    "פיצות": "Pizza",
    "פסטות": "Pasta",
    "ילדים": "Kids",
    "קינוחים": "Desserts",
    "התפריט": "The Menu",
    "הפוקאצ׳ה של VICO": "VICO's Focaccia",
    "פוקאצ׳ה חמה, שמן זית ובלסמי, סוכריות שום קונפי וסלסת עגבניות": "Warm focaccia with olive oil and balsamic, garlic confit candies and tomato salsa",
    "זוקיני, גילופי פרמזן, צנובר, נענע, לימון ושמן זית": "Zucchini, shaved parmesan, pine nuts, mint, lemon and olive oil",
    "זוקיני נענע": "Mint Zucchini",
    "חסה, בצל סגול, צנונית ופטה, ברוטב ויניגרט": "Lettuce, red onion, radish and feta with a vinaigrette",
    "ירוק קטן": "Little Green",
    "עגבניות מגי, מלפפון, בצל סגול, בזיליקום, פוקאצ׳ה קלויה ומוצרלה": "Maggie tomatoes, cucumber, red onion, basil, toasted focaccia and mozzarella",
    "פנצנלה": "Panzanella",
    "קיסר": "Caesar",
    "רוטב עגבניות, מוצרלה ובזיליקום": "Tomato sauce, mozzarella and basil",
    "מרגריטה": "Margherita",
    "חריפה": "Spicy",
    "רוטב עגבניות, מוצרלה, בולגרית, קלמטה, בצל וזעתר טרי": "Tomato sauce, mozzarella, Bulgarian feta, Kalamata olives, onion and fresh za'atar",
    "יוונית": "Greek",
    "בצלים": "Onion",
    "בצק שחור, רוטב שמנת, מוצרלה, שמפיניון ושימג׳י, שמן כמהין": "Black dough, cream sauce, mozzarella, button and shimeji mushrooms, truffle oil",
    "שחורה": "Black",
    "פסטה טרייה, רוטב לבחירה: עגבניות, רוזה או שמנת": "Fresh pasta with your choice of sauce: tomato, rosa or cream",
    "הקלאסית": "The Classic",
    "פסטה טרייה, עגבניות שרי, קלמטה, שום ושמן זית": "Fresh pasta, cherry tomatoes, Kalamata olives, garlic and olive oil",
    "אליו אוליו": "Aglio e Olio",
    "מנת פסטה קטנה, רוטב לבחירה: עגבניות, רוזה או שמנת, ירקות ושתייה": "A small portion of pasta with your choice of sauce (tomato, rosa or cream), veggies and a drink",
    "חצי פיצה מרגריטה, ירקות ושתייה": "Half a Margherita, veggies and a drink",
    "מגולגלות נוטלה חמות מהטאבון בליווי קצפת": "Warm Nutella rolls straight from the oven, with whipped cream",
    "מגולגלות נוטלה": "Nutella Rolls",
    "עוגת גבינה קלאסית": "Classic Cheesecake",
    "מוני שסק לבן": "Mony Shesek White",
    "אדיר בראש בלאן": "Adir Blush Blanc",
    "מוני פטיט ורדו": "Mony Petit Verdot",
    "אדיר קברנה סוביניון": "Adir Cabernet Sauvignon",
    "דרימיה סהר אדום": "Drimia Sahar Red",
    "אדיר פטיט סירה": "Adir Petite Sirah",
    "מוני רוזה קלאדוק": "Mony Caladoc Rosé",
    "אדיר רוזה": "Adir Rosé",
    "ויינשטפן 330 מ״ל": "Weihenstephan 330 ml",
    "ויינשטפן 500 מ״ל": "Weihenstephan 500 ml",
    "ויינשטפן": "Weihenstephan",
    "בקבוק 330 מ״ל": "330 ml bottle",
    "בקבוק 500 מ״ל": "500 ml bottle",
    "בקבוק": "Bottle",
    "כוס": "Glass",
    "בירה": "Beer",
    "הבר": "The Bar",
    ">בר<": ">Bar<",
    "המסעדה כשרה ✦ המחירים בש״ח וכוללים מע״מ ✦ התפריט מתעדכן מדי פעם": "Kosher ✦ Prices in ILS, VAT included ✦ Menu subject to change",
    "נשאר רק לבחור.": "Now for the hard part: choosing.",
    "מזמינים אונליין ואוספים חם — או קופצים לשבת איתנו בטרסה.": "Order online and pick up hot — or come sit with us on the terrace.",
    "הזמינו Takeaway": "Order Takeaway",
    "הזמנה": "Order",

    # ---- jobs page ----
    "עובדים איתנו | VICO הרצליה": "Work with us | VICO Herzliya",
    "VICO מגייסת — בואו לבשל ולארח איתנו באיטלקייה השכונתית של הרצליה.": "VICO is hiring — come cook and host with us at Herzliya's neighborhood Italian.",
    "באים לבשל איתנו? VICO מגייסת": "Want to cook with us? VICO is hiring",
    "אנחנו מחפשים אנשים עם תשוקה לאוכל, לאירוח ולחיוכים. אם אתם מעל גיל 18, מתאימה לכם עבודה במשמרות ובא לכם להיות חלק מהצוות של האיטלקייה השכונתית של הרצליה — דברו איתנו.": "We're looking for people who love food, hospitality and making people smile. If you're over 18, happy to work shifts and want to join the team at Herzliya's neighborhood Italian — get in touch.",
    "עובדים איתנו": "Work with us",
    "שלחו וואטסאפ": "Message us on WhatsApp",
    "%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A0%D7%99%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%9F%2F%D7%AA%20%D7%9C%D7%A2%D7%91%D7%95%D7%93%20%D7%91-VICO": "Hi%2C%20I%27d%20love%20to%20join%20the%20VICO%20team",
    "₪": "₪",
}

PAGES = [
    # (source, target, depth of target below site root)
    ("index.html", "en/index.html", 1),
    ("menu/index.html", "en/menu/index.html", 2),
    ("jobs/index.html", "en/jobs/index.html", 2),
]

# Kedem Sans only has small-cap Latin glyphs: fine for headlines and labels,
# unreadable for paragraphs. English pages get DM Sans for running text.
LATIN_FONTS = """<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" />
<style>
:root{--font-body:"DM Sans","Kedem Sans ML AAA",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
h1,h2,h3,.kicker,.btn,.arrow-link,.dish__name,.cocktail__name,.perk__title,.tonight__eyebrow,.tonight__title,.signup__eyebrow,.signup__title,
.hero__eyebrow,.hero__title,.h2,.insta__handle,.visit__facts dt,.visit__map-cap,.dish__badge,.bar__wines strong,.takeaway__list li,
.site-header__nav a,.site-header__drawer a,.site-mobilebar .btn,.footer__links a,.footer__contact-label,
.intro__title,.intro__card h2,.catnav a,.cat__title,.item__name,.item__price,.sub,.wine__head span,.wine__group,.wine__row span,.cta h2,.jobs__kicker,.jobs__title
{font-family:"Kedem Sans ML AAA",sans-serif}
.lead,.feel__body,.dish__desc,.cocktail__desc,.perk__desc,.perks__note,.signup__sub,.tonight__list li,.visit__facts dd,.takeaway__phone,.hero__sub,
.item__desc,.intro__card p,.intro__meta,.note p,.cta p,.jobs__text,.signup__legal,.footer__meta div,.footer__contact-row a,.footer__contact-row span,.footer__legal a
{letter-spacing:0}
</style>"""

HREFLANG = '<link rel="alternate" hreflang="he" href="https://www.vico.ltd{he}" />\n<link rel="alternate" hreflang="en" href="https://www.vico.ltd{en}" />\n<link rel="alternate" hreflang="x-default" href="https://www.vico.ltd{he}" />'


def he_path(src):
    p = "/" + src.replace("index.html", "")
    return p if p.endswith("/") else p + "/"


def translate(src, dst, depth):
    s = (ROOT / src).read_text(encoding="utf-8")
    src_depth = src.count("/")
    # asset paths: the English page sits one level deeper than its Hebrew source
    old_prefix = "../" * src_depth
    new_prefix = "../" * depth
    for attr in ("href", "src"):
        for folder in ("assets/", "ds/"):
            s = s.replace(f'{attr}="{old_prefix}{folder}', f'{attr}="{new_prefix}{folder}')
    s = re.sub(r'srcset="([^"]*)"', lambda m: 'srcset="' + m.group(1).replace(old_prefix + "assets/", "\x00") .replace("assets/", new_prefix + "assets/").replace("\x00", new_prefix + "assets/") + '"', s)
    s = re.sub(r'<link rel="alternate" hreflang="[^"]+" href="[^"]+" />\n', "", s)
    s = s.replace('<html lang="he" dir="rtl">', '<html lang="en" dir="ltr">')
    s = s.replace('content="he_IL"', 'content="en_US"')
    s = s.replace('"inLanguage": "he"', '"inLanguage": "en"')
    he = he_path(src)
    en = "/en" + he
    s = s.replace(f'href="https://www.vico.ltd{he}"', f'href="https://www.vico.ltd{en}"')
    s = s.replace(f'content="https://www.vico.ltd{he}"', f'content="https://www.vico.ltd{en}"')
    s = s.replace(f'"url": "https://www.vico.ltd{he}"', f'"url": "https://www.vico.ltd{en}"')
    s = s.replace("</title>", "</title>\n" + HREFLANG.format(he=he, en=en), 1)
    s = s.replace("</head>", LATIN_FONTS + "\n</head>", 1)
    # in-site links: keep the visitor inside the English version
    s = re.sub(r'href="/(#[^"]*)"', r'href="/en/\1"', s)
    s = s.replace('href="/menu/', 'href="/en/menu/').replace('href="/jobs/"', 'href="/en/jobs/"')
    # the "→" arrow is flipped for RTL; undo that in LTR
    s = s.replace("stroke-linecap:round;stroke-linejoin:round;transform:scaleX(-1)}", "stroke-linecap:round;stroke-linejoin:round}")
    for k in sorted(T, key=len, reverse=True):
        s = s.replace(k, T[k])
    left = sorted(set(m.group(0).strip() for m in re.finditer(r"[^<>\"'\n]*[֐-׿][^<>\"'\n]*", s)))
    if left:
        sys.stderr.write(f"\n{dst}: untranslated Hebrew:\n" + "\n".join("  " + l for l in left) + "\n")
        return False
    out = ROOT / dst
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(s, encoding="utf-8")
    print("wrote", dst)
    return True


def add_hreflang_to_hebrew(src):
    s = (ROOT / src).read_text(encoding="utf-8")
    if 'hreflang="en"' in s:
        return
    he = he_path(src)
    s = s.replace("</title>", "</title>\n" + HREFLANG.format(he=he, en="/en" + he), 1)
    (ROOT / src).write_text(s, encoding="utf-8")
    print("hreflang →", src)


if __name__ == "__main__":
    ok = all(translate(*p) for p in PAGES)
    for src, _, _ in PAGES:
        add_hreflang_to_hebrew(src)
    sys.exit(0 if ok else 1)
