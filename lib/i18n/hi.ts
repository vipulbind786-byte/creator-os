import type { TranslationKey } from "./keys"

export const hi: Record<TranslationKey, string> = {
  /* ---------- Common ---------- */
  "common.ok": "ठीक है",
  "common.cancel": "रद्द करें",
  "common.close": "बंद करें",

  /* ---------- Dashboard ---------- */
  "dashboard.title": "डैशबोर्ड",
  "dashboard.subtitle": "आपकी कमाई एक नज़र में",
  "dashboard.create_product": "प्रोडक्ट बनाएं",
  "dashboard.metric.failed_payments": "असफल भुगतान (7 दिन)",

/* ---------- Suggestions ---------- */
  "suggestions.title": "सुझाव",
  "suggestions.subtitle":
    "अपने विचार, फीडबैक या फीचर रिक्वेस्ट साझा करें",

  /* ---------- Dashboard Metrics ---------- */
  "dashboard.metric.today_revenue": "आज की कमाई",
  "dashboard.metric.total_revenue": "कुल कमाई",
  "dashboard.metric.best_selling_product":
    "सबसे अधिक बिकने वाला प्रोडक्ट",

  /* ---------- Orders ---------- */
  "orders.title": "ऑर्डर",
  "orders.subtitle": "अपने सभी बिक्री देखें",
  "orders.empty": "अभी कोई ऑर्डर नहीं है",

  /* ---------- Billing / Pricing (Transactions) ---------- */
  "billing.price": "कीमत",
  "billing.amount": "राशि",
  "billing.total": "कुल",
  "billing.buyer": "खरीदार",
  "billing.product": "प्रोडक्ट",
  "billing.date": "तारीख",

  "billing.status.paid": "भुगतान पूरा",
  "billing.status.failed": "असफल",
  "billing.status.refunded": "रिफंड किया गया",

  /* ---------- Pricing (Product Messaging) ---------- */
  "pricing.title": "सरल और गंभीर प्राइसिंग",
  "pricing.subtitle":
    "लंबे समय के क्रिएटर्स के लिए, ट्रायल-एंड-एरर यूज़र्स के लिए नहीं।",

  "pricing.plan.free.title": "फ्री",
  "pricing.plan.free.description":
    "सिस्टम को सुरक्षित रूप से एक्सप्लोर करें",

  "pricing.plan.pro.title": "OS+",
  "pricing.plan.pro.description":
    "सीरियस बिल्डर्स और लॉन्ग-टर्म यूज़र्स के लिए",

  "pricing.price.free": "₹0",
  "pricing.price.per_month": "/ माह",

  "pricing.badge.most_popular": "पावर यूज़र्स",

  "pricing.cta.current": "वर्तमान प्लान",
  "pricing.cta.upgrade": "OS+ में अपग्रेड करें",

  /* ---------- Insights ---------- */
  "insight.failed_payments.title": "भुगतान असफल हुए",
  "insight.failed_payments.body":
    "हाल ही में कुछ भुगतान असफल हुए हैं।",

  "insight.refunds.title": "रिफंड जारी किए गए",
  "insight.refunds.body":
    "पिछले कुछ दिनों में रिफंड किए गए हैं।",

  "insight.zero_revenue.title": "कोई कमाई नहीं हुई",
  "insight.zero_revenue.body":
    "हाल ही में कोई कमाई दर्ज नहीं हुई।",

  "insight.high_refund_rate.title": "उच्च रिफंड दर",
  "insight.high_refund_rate.body":
    "आपकी कमाई का बड़ा हिस्सा रिफंड हुआ है।",

  "insight.strong_performance.title": "आज का प्रदर्शन शानदार",
  "insight.strong_performance.body":
    "आज की कमाई आपकी कुल आय का अच्छा हिस्सा है।",

  "insight.no_best_seller.title": "कोई स्पष्ट बेस्ट सेलर नहीं",
  "insight.no_best_seller.body":
    "बिक्री कई प्रोडक्ट्स में बंटी हुई है।",

  /* ---------- Explain Drawer ---------- */
  "explain.title": "यह क्यों दिख रहा है?",
  "explain.loading": "लोड हो रहा है…",
  "explain.error": "जानकारी लोड नहीं हो सकी।",
  "explain.insight": "इनसाइट",
  "explain.triggered_by": "इसके कारण",
  "explain.current_value": "वर्तमान मान",
  "explain.previous_value": "पिछला मान",
  "explain.status": "स्थिति",
  "explain.why_now": "अभी क्यों?",
  "explain.suggestion": "सुझाव",

  /* ---------- CTA (Call-to-Action) ---------- */
  "cta.upgrade.label": "अभी अपग्रेड करें",
  "cta.upgrade.helper":
    "पेड प्लान के साथ यह फीचर अनलॉक करें",

  "cta.pay_now.label": "भुगतान अपडेट करें",
  "cta.pay_now.helper":
    "आपके भुगतान तरीके पर ध्यान देने की आवश्यकता है",

  "cta.fix_limit.label": "लिमिट बढ़ाएं",
  "cta.fix_limit.helper":
    "आप अपनी उपयोग सीमा तक पहुंच गए हैं",

  "cta.contact_support.label": "सपोर्ट से संपर्क करें",
  "cta.contact_support.helper":
    "हम मदद के लिए यहां हैं",
}