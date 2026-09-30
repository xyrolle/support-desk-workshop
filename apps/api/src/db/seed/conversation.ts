/**
 * Reusable lines for the generated conversations. Stories provide the specific
 * internal note and resolution of each ticket; these fill in the rest. `{name}`
 * becomes the requester's first name and `{teammate}` another teammate's.
 */

/** A teammate's first public reply, when they pick the ticket up. */
export const acknowledgements = [
  "Hi {name}, thanks for the report. I can see the same thing on our side and I'm looking into it now.",
  "Thanks {name}, that's really helpful. I've reproduced it and I'm working on it; I'll update you here.",
  "Hi {name}, thanks for flagging this. I'm on it and will get back to you today.",
  "Thanks for the details, {name}. I've passed this to the engineer who owns this area and I'm following it closely.",
  "Hi {name}, I've picked this up. First look: it isn't something in your settings, so this one is on us.",
  "Thanks {name}. I can confirm the behaviour and I'm digging into the logs now.",
  "Hi {name}, got it, thanks. I'm checking this against our recent changes and will report back shortly.",
  "Thanks for reaching out, {name}. I'm looking at this now and will update the ticket as soon as I know more.",
  "Hi {name}, thanks for the clear write-up. I'm investigating and will keep you posted here.",
  "Thanks {name}. We had a similar report this week, so I'm checking whether it's the same cause.",
  "Hi {name}, I'm taking this one. Give me a couple of hours to look into it properly.",
  "Thanks {name}, received. I've started on this and will share what I find.",
];

/** A teammate asks the customer for something and waits: the ticket goes to "waiting on customer". */
export const infoRequests: Record<string, string[]> = {
  checkout: [
    "Hi {name}, could you send us one or two affected order numbers and roughly when the shoppers tried to pay? That lets me find the exact requests in our logs.",
    "Thanks {name}. To narrow this down: does it happen for all payment methods, or only some? A screenshot of the error the shopper sees would help too.",
    "Could you check which checkout theme version your store is on (Settings → Checkout → Theme)? I'd like to rule out the older template.",
    "Hi {name}, can you tell us the shipping address country and postcode from one of the affected orders? I want to replay the rate calculation.",
    "To reproduce this I need the promo code and the cart contents (SKUs and quantities) of one failing attempt. Could you share those?",
    "Could you forward us the webhook delivery log from your endpoint for the time this happened? The request ids are enough.",
    "Hi {name}, which currency and payment provider account is this store using? I'd like to check the configuration on the provider side.",
  ],
  "mobile-app": [
    "Hi {name}, which app version and device model are the affected shoppers on? You'll find the version under Account → About in the app.",
    "Could you ask one affected shopper for a screen recording of the problem? It would help us a lot to see the exact steps.",
    "Thanks {name}. Is this happening on iOS, Android or both? And does it also happen on Wi-Fi, or only on mobile data?",
    "Could you share the email address of a test account where this happens? We'll try it on our devices with the same account.",
    "Hi {name}, can you check whether push notifications are enabled for the app in the phone's settings for one of these shoppers?",
    "To reproduce this I need the product link that fails to open. Could you paste one here?",
    "Which build are you testing: the App Store / Play Store version or the TestFlight / internal testing build?",
  ],
  "internal-tools": [
    "Hi {name}, could you attach the CSV file you tried to import (or the first 20 rows of it)? I want to see the exact column headers.",
    "Could you tell us the export's date range and filters, and roughly what time you started it? Then I can find the job on our side.",
    "Thanks {name}. For account changes like this we need a confirmation from the store owner's email address. Could you ask them to reply here?",
    "Which staff account is affected? Please send the email address, not the password.",
    "Could you share the error message you see, ideally with a screenshot of the whole page?",
    "Hi {name}, for a data request we need the shopper's email address and the order numbers involved. Can you send those?",
    "Which integration account is connected (the account name in the integration's settings)? I'd like to check the sync logs for it.",
  ],
  billing: [
    "Hi {name}, could you send us the invoice number (it starts with INV-) so I can check the charge?",
    "Thanks {name}. Could you confirm the company name, address and VAT ID exactly as they should appear on the invoice?",
    "Could you tell us the last four digits of the card that was charged? Then I can match it with the payment on our side.",
    "Before we change the plan, can the account owner confirm here that they approve the change?",
    "Hi {name}, which billing period is this about? A screenshot of the charge on your statement would help.",
    "Could you confirm the purchase order number you need on the invoice? We'll reissue it once we have it.",
    "To process the refund we need the account owner's confirmation. Could you ask them to reply to this ticket?",
  ],
};

/** The customer answers an info request, which puts the ticket back in progress. */
export const customerAnswers: Record<string, string[]> = {
  checkout: [
    "Sure. Order 482113 and 482120, both around 14:00 our time yesterday.",
    "It's only card payments as far as we can see. PayPal orders are fine. Screenshot attached.",
    "We're on theme version 3.2. Is that the old one?",
    "One of them was Oslo, 0150. The other one was in Bergen, I can look up the postcode if you need it.",
    "Code was WELCOME10, cart had two SKUs: TR-2041 (x1) and TR-1180 (x2).",
    "Here are the request ids from our logs: evt_8Kd2nQ and evt_8Kd2p1. Both got a 500 from our side first, then your retry.",
    "EUR, and we use the Stripe account that was connected last year.",
  ],
  "mobile-app": [
    "Most of them are on 5.12.0, on Samsung phones. One is on a Pixel 8.",
    "Here's a screen recording from one of our customers. It freezes right after tapping 'Pay'.",
    "Only Android as far as we know. Happens on both Wi-Fi and 4G.",
    "You can use test.shopper@ourstore.example, the password is in our shared vault, I'll send it separately.",
    "Notifications are enabled. She gets other apps' notifications fine.",
    "This one fails: https://shop.example/p/linen-shirt-sand. It opens the browser instead of the app.",
    "The store version. We don't use TestFlight at the moment.",
  ],
  "internal-tools": [
    "Attached the first rows. The columns are sku, title, price, stock, variant_of.",
    "All orders from last January to December, no filters. I started it around 9 in the morning.",
    "The owner will reply from her address in a minute.",
    "It's the account of our warehouse lead, logistics@ourstore.example.",
    "The page just says 'Something went wrong' with a reference code, screenshot attached.",
    "The shopper's email is in the attached PDF, together with her two order numbers.",
    "The account is called 'Store - main' in the integration settings.",
  ],
  billing: [
    "It's INV-2026-08811.",
    "Company name and address are in the attached PDF. The VAT ID is the one on our website footer.",
    "Card ending 4417.",
    "Confirming as account owner: yes, please go ahead with the change.",
    "It's the last billing period. Screenshot of the bank statement attached.",
    "PO number is PO-77120. Our accounts payable team can't pay without it.",
    "Owner here, I confirm the refund.",
  ],
};

/** The customer asks for news while the team works on it. */
export const customerNudges = [
  "Any update on this? Our team keeps asking me.",
  "Hi, just checking in. Is there anything we can do in the meantime?",
  "Still seeing this today. Do you have an ETA?",
  "Hello? It has been a few days now.",
  "Quick follow-up: this is still affecting orders on our side.",
  "Any news? We have a campaign going out on Friday and need this working.",
  "Can you give me an update I can pass on to my manager?",
  "Just wondering if this is being looked at, we haven't heard back.",
];

/** A teammate's reply to a nudge. */
export const progressUpdates = [
  "Hi {name}, sorry for the silence. We found the cause and the fix is in review; I expect it to ship this week.",
  "Thanks for your patience, {name}. The fix is being tested now; I'll confirm here once it's live.",
  "Hi {name}, quick update: we can reproduce it reliably now, which was the hard part. Working on the fix.",
  "Still on it, {name}. It turned out to be more involved than it looked, but it's our top item.",
  "Hi {name}, not forgotten! The change is ready and goes out with tomorrow's release.",
  "Thanks {name}. I've asked the team for an ETA and will get back to you by end of day.",
];

/** The customer thanks the team after the resolution. */
export const customerThanks = [
  "Confirmed, it works now. Thanks a lot!",
  "Perfect, thank you for the quick help.",
  "All good on our side now. Thanks!",
  "That did it. Thank you!",
  "Great, thanks for sorting this out so fast.",
  "Works, thanks. You can close this.",
  "Thank you, much appreciated.",
  "Thanks, that answers my question.",
];

/** An internal note when a ticket moves to another teammate. */
export const handoverNotes = [
  "Handing this over to {teammate}, who knows this area better than me.",
  "Reassigning to {teammate}: this needs someone from the team that owns this code.",
  "{teammate} is taking this one while I'm out tomorrow. Context is in the notes above.",
  "Moving to {teammate}. I've added what I found so far.",
];
