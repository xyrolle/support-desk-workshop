import type { ProjectStories } from "../story.ts";

export const billingStories: ProjectStories = {
  stories: [
    {
      title: "Paid the overdue invoice, store is still suspended",
      description:
        "Our card failed last week (the bank replaced it) and the store got suspended this morning. I added the new card and paid invoice INV-058214 right away, 79.00 EUR, and the billing page says Paid.\n\nBut 40 minutes later the storefront still shows 'This store is temporarily unavailable' and we can't open Orders. We normally do 30 to 40 orders before lunch. Please reactivate us now.",
      priority: "urgent",
      labels: ["Bug", "Failed payment"],
      note: "Payment succeeded in Stripe, but the `invoice.paid` webhook got a 503 during the billing-service deploy, so the reactivation job never ran. Replayed the event from the Stripe dashboard and the store came back; Chloé is checking for other stores stuck the same way.",
      resolution:
        "Hi {name}, your store is back online. Your payment went through straight away, but the message that should have reactivated the store got lost during a deploy on our side. We've replayed it and are checking that no other store was caught by the same problem.",
      tier: "pro",
    },
    {
      title: "Invoice shows store name instead of our legal entity",
      description:
        "Our invoices show the shop name as the customer. Our accountant needs the legal company name (a Ltd with a different name) and the registered address. Where do we change that?",
      priority: "medium",
      labels: ["Question", "Invoices"],
      note: "Common one: company name and address on invoices come from Settings > Billing > Billing details, not the store profile. Offered to regenerate their last three invoices once they've filled it in.",
      resolution:
        "Go to Settings > Billing > Billing details and fill in Company name and Billing address; invoices use those fields instead of the store name once they're set. If you need past invoices with the legal name, reply with the invoice numbers and we'll regenerate them.",
    },
    {
      title: "Still paying Free plan transaction fees after upgrading to Pro",
      description:
        "We upgraded from Free to Pro 12 days ago precisely to stop paying the 2% transaction fee. The payout report still takes it on every order.\n\nExpected: no platform fee on orders placed after the upgrade.\nActual: 2% 'Platform fee' on all 184 orders since then, 312.46 EUR in total.\n\nFrom the payout CSV:\n\n```\norder_id,gross,platform_fee,plan\n48213,64.90,1.30,pro\n48220,112.00,2.24,pro\n48231,38.50,0.77,pro\n```\n\nThe `plan` column even says pro. Please refund the fees.",
      priority: "high",
      labels: ["Bug", "Plan change"],
      note: "Payout fee rate is cached per store in the payments service and only refreshed when the payout schedule changes; their cache still had `fee_bps: 200`. Purged it, and Jonas confirmed 312.46 EUR to credit back.",
      resolution:
        "Hi {name}, you were right: the old Free plan fee kept being applied after your upgrade because of a stale setting on our side. It's fixed from today's orders on, and the 312.46 EUR in fees from the last 12 days will be added to your next payout.",
      tier: "pro",
    },
    {
      title: "Postcode cut off on invoice address",
      description:
        "On the invoice PDF the last line of our address is cut, the postcode doesn't show. We have a long street name, maybe that's why.",
      priority: "low",
      labels: ["Bug", "Invoices"],
      note: "Address block in the invoice template has a fixed height of four lines and theirs wraps to five. Chloé switched it to auto height and regenerated their latest invoice.",
      resolution:
        "The address block now grows with long addresses, and your latest invoice has been regenerated with the full postcode.",
    },
    {
      title: "How does proration work if we switch to annual now?",
      description:
        "We're on Pro monthly at 79.00 EUR and we're about halfway through the current month. If we switch to annual today, do we pay 790.00 on top of what we already paid, or do we get credit for the remaining two weeks?\n\nAnd does the annual period start today or at the next billing date?",
      priority: "medium",
      labels: ["Question", "Plan change"],
      note: "Standard proration: unused days of the monthly period are credited against the annual charge and the annual term starts on the day of the switch. Worked the example on their dates: 79.00 × 15/30 = 39.50.",
      resolution:
        "Hi {name}, if you switch today, the annual plan starts today and the unused part of your current month is taken off the first charge. With 15 of 30 days left you'd pay 790.00 - 39.50 = 750.50 EUR now, and the next renewal is a year from today.",
      tier: "pro",
    },
    {
      title: "Charged twice after retrying the failed payment",
      description:
        "The renewal failed, I clicked Retry payment, it said failed again, so I clicked again. Now my card shows two charges of 69.00 GBP and the invoice still says Unpaid.",
      priority: "high",
      labels: ["Bug", "Failed payment", "Refunds"],
      note: "Both retries actually succeeded at Stripe; the page showed 'failed' because the status poll timed out after 10s. Refunded the second charge and marked the invoice paid. Chloé linked it to the known Retry button timeout issue.",
      resolution:
        "Thanks {name}, one of the two 69.00 GBP charges has been refunded and the invoice now shows as paid. Both retries had worked, but the page timed out before it could tell you. We're fixing the button so it can't charge twice.",
      tier: "pro",
    },
    {
      title: "Removed the Advanced Reports add-on, still billed",
      description:
        "We removed the Advanced Reports add-on last month, just before our renewal, and got the confirmation email. This month's invoice still has it at 29.00 USD.\n\nThe reports menu is gone from our admin, so we can't even use it. Please refund and check it won't appear again next month.",
      priority: "medium",
      labels: ["Bug"],
      note: "They removed it in the last hour before renewal, after the renewal job had already locked the upcoming invoice, so the subscription item survived. Deleted the item and refunded 29.00.",
      resolution:
        "The add-on is now removed from your subscription and the 29.00 USD is refunded to your card. Your removal landed while this month's invoice was already being prepared, so it was billed one more time.",
    },
    {
      title: "Download all invoices for the year at once",
      description:
        "Every year our accountant asks for all invoices and I download them one by one (38 this year with the add-ons). A 'download all as ZIP' button would save a lot of clicks.",
      priority: "low",
      labels: ["Feature request", "Invoices"],
      note: "Bulk download is part of the invoices page rebuild, not scheduled. Jonas can produce a ZIP from the admin tool on request in the meantime.",
      resolution:
        "I've added your vote for a bulk download; it's part of the invoices page redesign but not scheduled yet. Until then, just ask us here and we'll send you a ZIP of any period within a day.",
    },
    {
      title: "Valid German VAT ID rejected as invalid",
      description:
        "I try to add our VAT ID in Settings > Billing > Tax details and it's rejected.\n\n- Country: Germany\n- VAT ID: DE298471356\n- Error: `tax_id_invalid: The VAT number could not be verified`\n\nThe number is valid, I checked it on the EU VIES website five minutes ago and it says 'Yes, valid VAT number'. I tried with spaces, without spaces and with lowercase `de`, same error.\n\nWithout it we pay 19% VAT on every invoice and have to reclaim it, and our tax advisor keeps asking why.",
      priority: "high",
      labels: ["Bug", "Tax ID"],
      note: "VIES returned `MS_UNAVAILABLE` for DE most of the morning and our validator treats that as invalid instead of pending. Saved their ID manually with `verification: pending`; Chloé opened a bug to retry VIES later instead of rejecting.",
      resolution:
        "Hi {name}, your VAT ID is now saved and your next invoice will use the reverse charge with no German VAT. The EU checking service for German numbers was down this morning and our form treated that as 'invalid' instead of trying again later. If you want this month's invoice corrected as well, reply here and we'll reissue it.",
    },
    {
      title: "Can't change the billing email, it reverts after saving",
      description:
        "I change the billing email in Settings > Billing from the old owner's address to our accounts inbox, click Save, get the green 'Saved' message. I reload the page and the old address is back.\n\nTried three times, in Firefox and Chrome. Invoices keep going to someone who left the company over the summer.",
      priority: "medium",
      labels: ["Bug"],
      note: "`PATCH /billing/contact` updates our DB, but the page reads the email back from the Stripe customer, and that update fails silently when the old contact is also a store owner. Updated the Stripe customer by hand; bug is with Tomás.",
      resolution:
        "The billing email is updated and the next invoice will go to your accounts inbox. The save only reached part of our system, so the page kept showing the old address. We're fixing that, and you don't need to change it again.",
    },
    {
      title: "Store suspended and the card form won't load",
      description:
        "We were suspended an hour ago for a failed payment. I want to pay but the card form never loads.\n\n1. Log in as owner, red banner says 'Your store is suspended'\n2. Click Update payment method\n3. The modal shows a spinner, after about 20 seconds 'Something went wrong'\n\nTried Chrome 129 and Firefox 131 on two laptops. The console shows:\n\n```\nPOST https://admin.brightcart.example/api/billing/setup-intent 403\n{\"error\":\"account_suspended\"}\n```\n\nSo we can't pay because we're suspended, and we're suspended because we didn't pay. Checkout is down for all our customers.",
      priority: "urgent",
      labels: ["Bug", "Failed payment"],
      note: "The suspension middleware now blocks `/api/billing/setup-intent` too; the allowlist only has `/api/billing/invoices` since the route rename in PR #5127. Tomás has a one-line fix up; meanwhile I sent them a hosted invoice payment link.",
      resolution:
        "Hi {name}, sorry, that was our bug: a recent change blocked the card form for suspended stores, which is exactly when you need it. I've emailed you a secure payment link for the open invoice, and the fix for the form goes out this afternoon. Your store reactivates within a minute of paying.",
    },
    {
      title: "Receipt emails don't show the VAT breakdown",
      description:
        "The payment receipt email just says 'Total 95.59 EUR'. For our bookkeeping we need net amount, VAT rate and VAT amount, like on the invoice PDF.",
      priority: "low",
      labels: ["Bug", "Tax ID", "Invoices"],
      note: "Known gap: the receipt email template only renders the total, the PDF has the full breakdown. Chloé says the new template in PR #5160 adds the tax lines.",
      resolution:
        "For now the invoice PDF in Billing > Invoices is the document with the full VAT breakdown, and it's the one your bookkeeper should use. The receipt email gets net, rate and VAT lines in an update later this month.",
      tier: "pro",
    },
    {
      title: "SEPA debit returned with AM04, but the money was there",
      description:
        "We pay Pro by SEPA direct debit. Yesterday we got an email that the payment was returned with reason AM04 (insufficient funds) and that we have 7 days before suspension. Our account had more than 12,000 EUR on it that day, I have the statement.\n\nWho is wrong here, you or our bank? And will we be charged a fee for the return?",
      priority: "high",
      labels: ["Question", "Failed payment"],
      note: "The debit went to the old IBAN ending 4410, which they replaced three weeks ago; the mandate for the new IBAN was created but never set as default. That old account is nearly empty, hence AM04. Switched the default mandate and waived the 5.00 EUR return fee.",
      resolution:
        "Thanks {name}, the debit was sent to your previous IBAN, not the one you added three weeks ago, so your bank returned it correctly. That's our mistake: the new account is now your default, the return fee is waived and the suspension warning is cancelled. We'll collect this month's 79.00 EUR from the new account in two business days.",
      tier: "pro",
    },
    {
      title: "Billed for 12 seats, we only have 8 staff",
      description:
        "Our Pro invoice charges 7 extra seats, so 12 in total. In Settings > Staff we have 8 people, and two of them are deactivated. Pro includes 5, so we should pay for 1 extra seat at most?\n\nThat's 60 USD a month more than we should pay.",
      priority: "medium",
      labels: ["Bug"],
      note: "Seat count includes pending invites that were never accepted, and they had four from last year. Revoked them, count dropped to 6, credited 60.00 for this month. Asked Chloé whether pending invites should count at all.",
      resolution:
        "You're now billed for 6 seats (1 extra), and 60.00 USD is credited to your next invoice. The count included four old staff invitations that were never accepted; I've revoked them. You can see and cancel pending invitations at the bottom of Settings > Staff.",
      tier: "pro",
    },
    {
      title: "Please accept PayPal for the subscription",
      description:
        "We'd like to pay the Brightcart subscription from our PayPal business account, that's where our sales money is. Is it possible?",
      priority: "low",
      labels: ["Feature request"],
      note: "Subscription billing takes cards and SEPA/Bacs direct debit only. We get a handful of PayPal requests a quarter; logged this one.",
      resolution:
        "Not at the moment: the subscription can be paid by card or by SEPA or Bacs direct debit. I've logged your request for PayPal, though it isn't planned right now.",
    },
    {
      title: "Paid invoice still marked as overdue",
      description:
        "INV-059772 was paid by bank transfer last week and the money has left our account, with the invoice number as reference. Billing still shows it as Overdue in red.\n\nThis is the second time this happens in a few months. Please update it, our CFO looks at this page and asks me every time.",
      priority: "medium",
      labels: ["Bug", "Invoices"],
      note: "Payment was matched in the finance ledger but the status sync to Stripe hit a rate limit and never retried. Marked it paid out of band; Jonas found 11 more stuck in the retry queue and is clearing them.",
      resolution:
        "INV-059772 now shows as paid. Your payment had been received and matched, but the status didn't reach the billing page. We've fixed it for your invoice and a few others with the same problem.",
      tier: "enterprise",
    },
    {
      title: "Your bank details changed on the invoice, is this real?",
      description:
        "We pay you by bank transfer. The invoice we got today, INV-060711, shows different bank details from the ones we've paid to for two years (IBAN now starts IE64, before it was IE29).\n\nWe had a supplier fraud case last year with exactly this kind of change, so we won't pay until someone confirms. Please confirm through the account or by phone, not only by replying to the email.",
      priority: "high",
      labels: ["Question", "Invoices"],
      note: "Genuine: Jonas confirmed the move to the new collection account, and the notice went to Enterprise billing contacts last month. Posted a confirmation banner on their billing page and asked Ravi to call their finance lead too.",
      resolution:
        "Hi {name}, you were right to check. The new details are genuine: we moved to a new collection account last month, and you'll see a notice confirming it at the top of Settings > Billing when you log in. Your account manager will also call you today. Payments to the old account are forwarded until the end of the year, so nothing is lost either way.",
      tier: "enterprise",
    },
    {
      title: "What do we lose if we go back to Free?",
      description:
        "We are thinking to downgrade from Pro to Free for the winter because sales are low. What happens with our custom domain, the 6 staff accounts and the abandoned cart emails? Do we lose the data or only the features?",
      priority: "low",
      labels: ["Question", "Plan change"],
      note: "Free: brightcart.example subdomain only, 2 staff, no automations. Data is kept, features pause. Worth mentioning the 2% fee on Free since at their volume Pro may still be cheaper.",
      resolution:
        "Nothing is deleted when you downgrade; features just pause. On Free your custom domain stops pointing to the store, only the owner and one staff account stay active, and abandoned cart emails stop until you upgrade again. Keep in mind Free adds a 2% transaction fee, so above roughly 4,000 EUR in monthly sales, Pro is still the cheaper option.",
      tier: "pro",
    },
    {
      title: "Hit the Free plan order limit, upgrade to Pro fails",
      description:
        "We were in a newspaper this morning and hit the 100 orders a month limit of the Free plan at 10:15. Checkout now says 'This store can't accept orders right now'. Fine, we want to upgrade, but it fails every time:\n\n1. Settings > Plan > Choose Pro (monthly)\n2. Enter card (Visa, Netherlands), approve 3-D Secure in the bank app\n3. Page shows `Error: plan_change_failed (subscription_locked)`\n\nWe tried 4 times. The bank shows 4 holds of 79.00 EUR. Every order from the article is lost right now. Please help fast.",
      priority: "urgent",
      labels: ["Bug", "Plan change"],
      note: "The first attempt left the subscription with a `pending_update` because the 3DS confirmation came back after our 30s timeout, so every retry hit the lock. Cleared the pending update, applied Pro on the first payment, voided the other three authorizations in Stripe.",
      resolution:
        "Thanks {name}, you're on Pro and checkout is accepting orders again. Your first payment went through, but our side timed out waiting for your bank's 3-D Secure confirmation and then blocked the retries. The three extra 79.00 EUR holds are released and will disappear from your account in a few days.",
      tier: "free",
    },
    {
      title: "Why do we pay VAT on our invoice as a UK company?",
      description:
        "We're a UK limited company, VAT registered. Our last invoices add 20% VAT on top of the 69.00 GBP. Our accountant says a UK business buying from an Irish company shouldn't have VAT on the invoice and should account for it ourselves.\n\nIs she right? Our VAT number is saved in Billing.",
      priority: "medium",
      labels: ["Question", "Tax ID"],
      note: "Their number was saved as an `eu_vat` with a GB prefix, which we stopped accepting after Brexit, so tax calculation ignored it. Re-added as `gb_vat`; Jonas is issuing corrected invoices for the last three months.",
      resolution:
        "Hi {name}, your accountant is right. Your VAT number was saved in an old format we no longer recognise, so it was ignored. I've re-added it correctly: future invoices show no VAT with a reverse charge note, and corrected invoices for the last three months are in Billing > Invoices, with the VAT refunded to your card.",
      tier: "pro",
    },
    {
      title: "Cancelled last month, charged again today",
      description:
        "I cancelled our Pro subscription last month, I even have a screenshot of 'Your plan ends at the end of this period'. Today you charged 79.00 USD again. Refund it please, and make sure it's actually cancelled this time.",
      priority: "high",
      labels: ["Bug", "Cancellation", "Refunds"],
      note: "Cancellation was saved as `cancel_at_period_end`, but they removed a staff seat afterwards and the seat update re-created the subscription item and reset the flag. Refunded, cancelled for real, and added this repro to Chloé's ticket about seat edits after cancellation.",
      resolution:
        "Hi {name}, you're right, and I'm sorry. The 79.00 USD is refunded and your subscription is now fully cancelled, with no further charges. Removing a staff account after you'd cancelled switched the renewal back on by mistake; we're fixing that.",
      tier: "pro",
    },
    {
      title: "Free plan keeps asking for a payment method",
      description:
        "We're on Free but every time I log in a popup says 'Add a payment method to continue'. I close it and everything works. Why does Free need a card?",
      priority: "low",
      labels: ["Bug"],
      note: "Popup comes from the `billing_pm_prompt` experiment, which should only target accounts coming out of a trial. Their account still had a `trial_ended` flag from a trial two years ago; cleared it.",
      resolution:
        "You won't see that popup again. It was meant only for stores coming out of a trial, and your account still carried an old trial marker. Free doesn't need a payment method.",
      tier: "free",
    },
    {
      title: "Discount agreed with sales missing from invoice",
      description:
        "When we signed for Enterprise, your sales team agreed on 15% off for the first year, it's in the order form. The first invoice, INV-060233, is the full 2,400.00 USD.\n\nCan you correct it before our finance team pays? It's due in 10 days.",
      priority: "medium",
      labels: ["Bug", "Invoices"],
      note: "Coupon `ENT-15-12M` exists in Stripe but was never attached to the subscription; the order form in the CRM confirms 15% for 12 months. Attached it, voided INV-060233 and reissued as INV-060261.",
      resolution:
        "Hi {name}, you're right: the 15% discount from your order form wasn't attached to your subscription. I've voided INV-060233 and issued INV-060261 for 2,040.00 USD, and the discount applies to your next 11 invoices as well.",
      tier: "enterprise",
    },
    {
      title: "Invoices page errors out, need them for year-end",
      description:
        'Our accountant needs all invoices for the financial year by Friday. Billing > Invoices loads the first 25, then Load more fails with \'Could not load invoices\'.\n\nFrom the network tab:\n\n```\nGET /api/billing/invoices?starting_after=in_1PqT8x2eZvKYlo2C\n500 Internal Server Error\n{"error":{"code":"internal","message":"Something went wrong"}}\n```\n\nWe\'ve been a customer for four years, maybe it\'s the number of invoices? Same in Chrome and Edge.',
      priority: "high",
      labels: ["Bug", "Invoices"],
      note: "Sentry BILLING-API-5A1: the pagination cursor lands on an invoice from their old account that was merged into this one, and the ownership check throws instead of skipping it. Chloé exported all 58 invoices as a ZIP for them; fix is in PR #5219.",
      resolution:
        "Hi {name}, I've emailed you a ZIP with all your invoices so your accountant isn't blocked. The page broke on invoices from an older account that was merged into yours years ago; the fix goes out this week and Load more will work again.",
    },
    {
      title: "Do app developers count as staff seats?",
      description:
        "Our freelance developer needs admin access to install a new theme. Will adding her cost us a seat?",
      priority: "low",
      labels: ["Question"],
      note: "Collaborator accounts requested through a Partner login don't count toward seats; regular staff accounts do. Pointed them to collaborator requests.",
      resolution:
        "If she uses a collaborator account, it's free: she requests access from her Brightcart Partner login and you approve it in Settings > Staff > Collaborators. Only regular staff accounts count as seats.",
    },
    {
      title: "Tax ID disappears after changing billing address",
      description:
        "We moved office, so I updated the billing address. Now our tax ID keeps disappearing.\n\n1. Settings > Billing > Billing details\n2. Change the street address, country stays Spain\n3. Save\n4. Scroll to Tax details: our NIF-IVA ESB76529340 is gone\n5. Add it again, save, it's back\n6. Change the address again to fix a typo: the tax ID is gone again\n\nIf it stays like this the next invoice will have 21% VAT. Can you check it is saved now?",
      priority: "medium",
      labels: ["Bug", "Tax ID"],
      note: "The address form sends the whole customer object to `customers.update`, including an empty `tax_ids` array, which deletes the ID. Theirs is restored and verified; Tomás has the bug, it affects anyone who edits their address.",
      resolution:
        "Your tax ID is saved and verified, and your next invoice will use the reverse charge. Editing the address was wiping the tax ID in the background; we're fixing that. Until the fix is out, please check the Tax details section after any address change.",
    },
    {
      title: "No credit for unused Pro when we upgraded to Enterprise",
      description:
        "We moved from Pro annual to Enterprise yesterday. We paid 790.00 USD for Pro annual about four months ago. The Enterprise invoice INV-060455 charges the full first month, 2,400.00 USD, with no credit for the eight months of Pro we already paid for.\n\nThe email from sales said unused time would be credited. Where is it?",
      priority: "high",
      labels: ["Bug", "Plan change"],
      note: "Sales created Enterprise as a new subscription instead of upgrading the existing one, so no proration ran and the Pro sub would have renewed at the end of its term. Cancelled the Pro sub and applied 526.67 USD (8/12 of 790.00) as account credit.",
      resolution:
        "Thanks {name}, the credit for your unused Pro time, 526.67 USD, is now on your account and comes off your next Enterprise invoice. Your Enterprise plan was set up as a separate subscription instead of replacing Pro, so the credit wasn't calculated. I've also closed the old Pro subscription so it won't renew.",
      tier: "enterprise",
    },
    {
      title: "Is this payment failure email really from you?",
      description:
        "We got an email 'Your Brightcart payment failed, update your card within 48 hours' from billing@brightcart.example with a link. Our IT says to always check first because of phishing, and as far as I can see our card was charged normally last week.\n\nIs this real?",
      priority: "medium",
      labels: ["Question", "Failed payment"],
      note: "Genuine: the Advanced Reports add-on is billed on a separate subscription that still had their expired card on it. Told them to go to Billing directly rather than use the link.",
      resolution:
        "It's genuine: the payment for your Advanced Reports add-on (29.00 USD) failed because it was still set to an old card. You don't need the link: log in, open Settings > Billing and click Pay now next to the open invoice. Checking before clicking was the right call.",
    },
    {
      title: "Store locked as unpaid, but the charge went through",
      description:
        "We switched from monthly to annual this morning and paid 790.00 USD, the card statement shows it and the invoice in Billing is marked Paid. An hour later the admin says 'Subscription inactive, update your payment details' and the storefront shows the maintenance page.\n\nWe never got a failed payment email. What is going on? Every minute offline costs us money.",
      priority: "urgent",
      labels: ["Bug", "Failed payment"],
      note: "Two subscriptions on the account: the monthly one was cancelled when they switched, and the suspension check reads the first subscription it finds, which is the cancelled one. Same root cause as Sentry BILLING-API-4F2 from last week. Set the store back to active by hand.",
      resolution:
        "Your store is live again, {name}. When you switched to annual, our system kept looking at your old monthly subscription, which is now closed, and treated the store as unpaid. Your annual payment is fine and nothing needs to change on your side; we're fixing the check so it can't happen to another store.",
      tier: "pro",
    },
    {
      title: "Add an ABN field for Australian merchants",
      description:
        "There is no place to enter our Australian Business Number. Our accountant needs it on the invoices for GST. Can you add it?",
      priority: "low",
      labels: ["Feature request", "Tax ID"],
      note: "Tax details form only offers EU, UK, CH, CA and US types. Stripe supports `au_abn`, Tomás thinks it's about a day of work. Added to the tax ID backlog and set it on their customer manually.",
      resolution:
        "That's a gap in our tax details form. I've put the ABN field on our backlog; it's a small change but not scheduled yet. Meanwhile I've added your ABN to your account by hand, so it appears on invoices from the next one.",
    },
    {
      title: "Billed in USD although our billing country is Germany",
      description:
        "We signed up for Pro with a German address and a German card, but every invoice is in USD (79.00 USD). Our bank charges 1.75% foreign currency fee on each payment and our accountant has to convert every invoice.\n\nYour pricing page shows 79.00 EUR for Germany. Please switch us to EUR.",
      priority: "medium",
      labels: ["Bug", "Invoices"],
      note: "Currency is fixed on the Stripe customer at first payment, and they signed up through a US pricing page link. Stripe can't change currency mid-subscription, so Jonas re-created it in EUR starting next period.",
      resolution:
        "Hi {name}, from your next renewal you'll be billed 79.00 EUR instead of USD. Your account picked up USD from the page you signed up on, and currency can only change at the start of a billing period, so this month stays in USD.",
      tier: "pro",
    },
    {
      title: "Upgrade button spins forever on Safari",
      description:
        "I want to upgrade from Free to Pro before our launch on Monday, we need it for the custom domain.\n\n1. Safari 18.1 on macOS\n2. Settings > Plan > Upgrade to Pro\n3. Pick monthly, click Continue\n4. Spinner on the button, forever. I waited 5 minutes.\n\nSafari console:\n\n`Refused to load https://js.stripe.com/v3/ because it does not appear in the frame-src directive of the Content Security Policy.`\n\nChrome is not allowed on this company laptop.",
      priority: "high",
      labels: ["Bug", "Plan change"],
      note: "CSP header on the new plan page is missing `js.stripe.com` in `frame-src`; Chrome only works because it gets a cached page with the old header. PR #5203 adds it. Sent them a checkout link from the billing tool in the meantime.",
      resolution:
        "Hi {name}, the upgrade page was blocking the card form in Safari because of a security setting we forgot to update. That's fixed now, so please try again. If anything still spins, the payment link I emailed you does the same upgrade.",
      tier: "free",
    },
    {
      title: "Refund went to a card we closed",
      description:
        "Your colleague refunded the 79.00 EUR double charge yesterday, but it went to our old card, which we closed last month when we changed banks. The new card is on the account since then.\n\nWill we still get the money, or do we need to ask you again? I'd rather not wait two weeks to find out.",
      priority: "medium",
      labels: ["Question", "Refunds"],
      note: "Refund shows succeeded in Stripe, so the issuer accepted it. Issuers normally route refunds on closed cards to the linked account; if nothing shows in 10 business days we can pay it by bank transfer instead.",
      resolution:
        "The refund was accepted by your bank, and banks normally pass refunds for closed cards on to the linked account or the replacement card. If it hasn't shown up within 10 business days, reply here with your IBAN and we'll send it by bank transfer instead.",
      tier: "pro",
    },
    {
      title: "Let us move our billing date to the 1st",
      description:
        "Our renewal is on the 19th of each month. Can we move it to the 1st so it lines up with our accounting month?",
      priority: "low",
      labels: ["Feature request"],
      note: "Billing anchor changes aren't self-serve. Jonas moved it by hand with a one-off prorated charge and logged a self-serve request.",
      resolution:
        "Done: your billing date is now the 1st. You'll see a one-off charge of 31.60 USD for the days between your last renewal and the 1st, then the usual 79.00 USD from next month. Changing the date yourself isn't possible yet; I've logged that as a request.",
      tier: "pro",
    },
    {
      title: "Cancel flow keeps looping back to the discount offer",
      description:
        "I'm trying to cancel. Settings > Plan > Cancel plan, it asks why, I pick 'Closing the business', it offers 3 months at 50%, I click 'No thanks, cancel' and I'm back on the first screen. Five times now. This is starting to feel intentional.\n\nPlease cancel our Pro plan at the end of the current period.",
      priority: "high",
      labels: ["Bug", "Cancellation"],
      note: "'No thanks' submits the retention form with `accepted=false`, and the new flow behind `billing_retention_v2` redirects to step 1 on that response. Cancelled them from the admin tool and turned the flag off until Tomás fixes it.",
      resolution:
        "It wasn't intentional, but it was broken: the button sent you back to the start instead of cancelling. Your Pro plan is now cancelled and stays active until the end of the period you've paid for, with no further charges. The confirmation email is on its way.",
      tier: "pro",
    },
    {
      title: "What is the GMV overage line on our invoice?",
      description:
        "This month's Enterprise invoice INV-060498 has a line we've never seen:\n\n```\nEnterprise platform fee            2,400.00 EUR\nGMV overage (184,300.00 x 0.25%)     460.75 EUR\nVAT (reverse charge)                   0.00 EUR\nTotal                              2,860.75 EUR\n```\n\nIs this correct? Nobody told us about an overage fee, and our Brightcart budget is fixed for the year. If it's in the contract, please point me to the clause.",
      priority: "medium",
      labels: ["Question", "Invoices"],
      note: "Contract includes 2M EUR GMV a month with 0.25% above that (schedule B, clause 4.2). Their big sale took last month to 2,184,300 EUR, so the line is right. Asked Ravi to walk them through the tiers since they'll likely hit it again.",
      resolution:
        "Hi {name}, the line is correct: your Enterprise contract includes up to 2,000,000 EUR in sales per month, with a 0.25% fee above that (schedule B, clause 4.2). Last month you sold 2,184,300 EUR, so 184,300 EUR was over the limit. If you expect volumes like this to continue, your account manager can go through a higher tier with you, which would work out cheaper.",
      tier: "enterprise",
    },
    {
      title: "Bank blocked our renewal, please don't suspend us tonight",
      description:
        "Hello, our Pro renewal failed because our bank (we are in Portugal) blocked the payment as 'suspicious foreign transaction'. The bank can unblock only tomorrow morning, the card department is closed now.\n\nIn the admin it say the store will be suspended today at 23:59 if we don't pay. We have a sale tonight and the newsletter is already sent. Can you give us one more day please?",
      priority: "urgent",
      labels: ["Question", "Failed payment"],
      note: "Grace period ended 23:59 Europe/Lisbon. Pushed the suspension date back 72h with the `dunning_override` tool, Aisha OK'd it. Reminder set to check the automatic retry.",
      resolution:
        "Thanks {name}, no problem: I've pushed your suspension date back by three days, so your sale tonight is safe. Once your bank has unblocked the card, click Retry payment on the Billing page, or just wait and we'll retry automatically tomorrow afternoon.",
      tier: "pro",
    },
    {
      title: "No warning before our card expired",
      description:
        "Our card expired at the end of last month and the renewal failed. Most services warn you before, we never got anything from Brightcart. I've added the new card and paid now.",
      priority: "low",
      labels: ["Bug", "Failed payment"],
      note: "Expiry reminder job skips cards added through the mobile admin app because `exp_month` is stored as a string there. Fixed their record; Chloé filed the bug.",
      resolution:
        "You should have had a reminder 30 days before the card expired. Cards added through the mobile admin app were skipped by that reminder because of a bug we're now fixing. Your new card is saved and the invoice is paid, so nothing else is needed.",
    },
    {
      title: "Receipt PDF downloads as a blank page",
      description:
        "When I download a receipt from Billing > Payments, the PDF is one blank white page.\n\n1. Billing > Payments\n2. Click the download icon next to any payment (tried three)\n3. `receipt-ch_3Q7xR2eZvKYlo2C.pdf` opens: 1 page, blank, 2 KB\n\nInvoices under Billing > Invoices download fine, only receipts are blank. Same in Chrome 129 and in Adobe Reader. Our bookkeeper needs the receipts for the card payments.",
      priority: "medium",
      labels: ["Bug", "Invoices"],
      note: "Receipt renderer loads the logo from the old CDN host that was switched off yesterday; the PDF service fails silently and returns an empty document. Chloé pointed the template at the new host and regenerated receipts look fine.",
      resolution:
        "Thanks {name}, receipts download correctly again. Our receipt template was still loading an image from an old server we'd shut down, which made the PDF come out blank. You can download them from the same place as before.",
    },
    {
      title: "Bank transfer sent, still getting overdue warnings",
      description:
        "We paid INV-059418 by bank transfer 9 days ago. Today we got the second overdue reminder, saying the store will be suspended in 5 days.\n\nTransfer details from our bank:\n\n```\nAmount:      14,400.00 EUR\nBeneficiary: Brightcart Ltd\nIBAN:        IE64 **** **** **** 2193\nReference:   PO-88312\n```\n\nI think our accounts team used our PO number as the reference instead of the invoice number. Can you find the payment and stop the reminders please? I really don't want to explain a suspension to our CEO.",
      priority: "high",
      labels: ["Question", "Invoices", "Failed payment"],
      note: "Found it in unmatched bank receipts: 14,400.00 EUR, reference 'PO-88312', arrived 7 days ago. Jonas matched it to INV-059418 manually and the dunning sequence stopped.",
      resolution:
        "Thanks {name}, we found your transfer: it arrived on time, but with your PO number as the reference, so it wasn't matched to the invoice automatically. It's now marked paid and the reminders have stopped. For future payments, include the invoice number in the reference and it'll be matched the same day.",
      tier: "enterprise",
    },
    {
      title: "Need a credit note for the refunded invoice",
      description:
        "You refunded INV-059845 in full. Our accountant needs a credit note, not just the money back on the card. Where can we download it?",
      priority: "low",
      labels: ["Question", "Refunds", "Invoices"],
      note: "Refund was done directly in Stripe without a credit note, so nothing shows on their billing page. Jonas issued CN-00471 against the invoice.",
      resolution:
        "Credit note CN-00471 is now in Billing > Invoices, next to the original invoice. The refund was made without one, which shouldn't have happened.",
    },
    {
      title: "Account credit not applied to this month's invoice",
      description:
        "We have 150.00 USD credit on the account from the goodwill gesture after the outage, it shows in Billing > Credit balance. This month's invoice INV-060712 charged our card the full 79.00 USD and the credit is still 150.00.\n\nShouldn't the credit be used first?",
      priority: "medium",
      labels: ["Bug", "Invoices"],
      note: "The credit was added to our internal ledger instead of the Stripe customer balance, so invoices never consume it. Moved it to the Stripe balance and refunded the 79.00 card charge against it.",
      resolution:
        "You're right, the credit should have been used. I've refunded this month's 79.00 USD to your card and paid the invoice from your credit instead, which leaves 71.00 USD for next month. The credit had been added to your account in a way invoices didn't pick up.",
      tier: "pro",
    },
    {
      title: "Renewal failed, 3-D Secure prompt never shown",
      description:
        "Our monthly payment failed three times this week with 'Authentication required'. Our bank (we're in France) says the card is fine and that every payment needs 3-D Secure under their new rules.\n\nWhat happens:\n\n1. We get the email 'Action needed: confirm your payment'\n2. The link opens Billing, which shows 'Payment failed' and a Retry button\n3. Retry fails immediately with `authentication_required`: no bank popup, no notification in the banking app\n\nSame on Safari and Chrome. The store gets suspended on Friday if this keeps failing.",
      priority: "high",
      labels: ["Bug", "Failed payment"],
      note: "Retry calls `invoices.pay` server-side, so 3DS is never presented to the customer. The hosted invoice page does handle it, so I sent them that link; Tomás has the proper fix in PR #5188.",
      resolution:
        "Hi {name}, I've emailed you a direct payment link that opens your bank's 3-D Secure check; once you approve it there, the invoice is paid and the suspension warning disappears. Our Retry button wasn't triggering 3-D Secure for cards that always need it, and that fix ships next week.",
    },
    {
      title: "Enterprise invoice due in 14 days, contract says 30",
      description:
        "Our contract says net 30 but INV-060604 shows a due date 14 days after issue. Please fix it, our AP team only runs payments once a month.",
      priority: "medium",
      labels: ["Bug", "Invoices"],
      note: "`days_until_due` on the Stripe customer was the default 14; the net 30 terms were set on the old subscription and didn't carry over at contract renewal. Set 30 on the customer and moved the open invoice's due date.",
      resolution:
        "INV-060604 now shows a due date 30 days after issue, and all future invoices will too. Your net 30 terms hadn't carried over when the contract renewed.",
      tier: "enterprise",
    },
    {
      title: "Invoices in German, please",
      description:
        "Is it possible to get the invoices in German language? The tax office accepts English, but our bookkeeper prefers German and our admin is already in German.",
      priority: "low",
      labels: ["Feature request", "Invoices"],
      note: "Invoice templates are English only. Localised invoices sit with the e-invoicing work on the billing roadmap; logged a +1 for DE.",
      resolution:
        "Invoices are only available in English for now. I've added your vote for German invoices; it isn't planned for this quarter.",
    },
    {
      title: "Charged 7,900 USD instead of 790",
      description:
        "We just renewed Pro annual and our card was charged 7,900.00 USD, not 790.00. That's our whole operating account for the month. Please refund the difference today, payroll runs tomorrow.",
      priority: "urgent",
      labels: ["Bug", "Refunds"],
      note: "The price override on this subscription was set to `790000` cents instead of `79000` during last month's grandfathering migration. Refunded 7,110.00 immediately and fixed the override; Jonas is scanning the other migrated overrides for the same typo.",
      resolution:
        "Hi {name}, we've refunded 7,110.00 USD, so you've now paid the correct 790.00 in total. The price on your subscription had a typo from a migration on our side, and it's corrected. Card refunds usually take 5 to 10 business days; if your bank can speed it up with a reference, reply here and I'll send it straight away.",
      tier: "pro",
    },
    {
      title: "Dunning emails going to every staff member",
      description:
        "Since the card payment failed yesterday, all 9 of our staff, including the warehouse team, got the email 'Payment failed: your store may be suspended'. Two of them asked me if the company is going bankrupt.\n\nThis should only go to the owner and the billing contact.",
      priority: "medium",
      labels: ["Bug", "Failed payment"],
      note: "The notifications refactor (PR #5091) switched the dunning template to the 'store admins' list, which includes any staff with admin access. Reverted to owner + billing contact; Chloé checked and 312 stores got the same broadcast yesterday.",
      resolution:
        "Hi {name}, you're right, those emails should only go to the owner and the billing contact. A change on our side widened the recipient list yesterday; it's reverted, so your staff won't get billing emails again. Sorry for the awkward conversations it caused.",
    },
    {
      title: "Can't downgrade: staff limit error after removing staff",
      description:
        "Our Pro renews tomorrow and we want to go to Free. I removed staff accounts so we're at 2, which Free allows. Still:\n\n1. Settings > Plan > Downgrade to Free\n2. Confirm\n3. Red message: `plan_limit_exceeded: staff_accounts (5/2)`\n\nSettings > Staff lists exactly 2 people. Please fix this before the renewal, or refund the renewal if it goes through.",
      priority: "high",
      labels: ["Bug", "Plan change"],
      note: "Deactivated staff still count as seats until the nightly seat sync. Ran the sync for their store manually and the downgrade went through; Chloé filed a bug to count only active staff at downgrade time.",
      resolution:
        "Thanks {name}, the downgrade to Free is done, so there won't be a Pro renewal tomorrow. The limit check was still counting the staff accounts you'd just removed, because those are only cleared overnight. We're changing it to count only active staff.",
      tier: "pro",
    },
    {
      title: "Add-on lines have no description on the invoice PDF",
      description:
        "Our invoice has two lines that just say 29.00 and 49.00 with no name. Which add-ons are these? Our accountant is asking.",
      priority: "low",
      labels: ["Bug", "Invoices"],
      note: "Add-on prices created after the catalog migration have an empty `description`, and the PDF prints that. These are Advanced Reports (29) and Extra storefront (49); Jonas is backfilling the descriptions.",
      resolution:
        "Those are Advanced Reports (29.00) and Extra storefront (49.00). The names were missing because of a gap in our product setup; your invoice has been regenerated with them, and future invoices will show them too.",
    },
    {
      title: "Charged GST although we entered our Canadian GST number",
      description:
        "We're a Canadian business and our GST/HST number 812345678RT0001 is in Billing. The last two invoices still add 5% GST, 3.95 USD each. Our accountant says a non-resident supplier shouldn't charge GST to a registered business.\n\nCan you correct them?",
      priority: "medium",
      labels: ["Bug", "Tax ID"],
      note: "The tax details form stored the number with type `unknown` instead of `ca_gst_hst`, so tax calculation ignored it. Fixed the type; Jonas refunded 7.90 and Chloé is checking the other Canadian merchants.",
      resolution:
        "Your GST/HST number is now recognised and future invoices won't include GST. It had been saved in a way our tax calculation ignored. The 7.90 USD from the last two invoices is refunded to your card.",
      tier: "pro",
    },
    {
      title: "Renewed at full price, our legacy price gone without notice",
      description:
        "Our Pro annual renewed today at 790.00 USD. We've been on the old 590.00 price for three years. Nobody told us that was ending, and I'm not happy about finding this on a card statement.\n\nIf there was an email, send me a copy. If not, I expect the old price for this year.",
      priority: "high",
      labels: ["Question", "Plan change"],
      note: "The 60-day notice about legacy prices ending went to their previous owner's billing email and bounced; there was no other contact on the account. Aisha agreed to honour 590.00 for this renewal, refunded 200.00.",
      resolution:
        "Hi {name}, you're right that you never got the notice: it went to your previous owner's address, which bounced. Since you had no chance to react, we've refunded the 200.00 USD difference, so this year stays at 590.00. Next year's renewal will be at the current price, and the billing email on the account is now yours.",
      tier: "pro",
    },
    {
      title: "Refund still not on our statement after 10 days",
      description:
        "Support told us 10 days ago that the 69.00 GBP refund was done. It's still not on our statement. Can you send a reference we can give to our bank?",
      priority: "medium",
      labels: ["Question", "Refunds"],
      note: "Refund succeeded 10 days ago and the ARN is in Stripe. Business cards from this issuer are known to take up to 15 business days.",
      resolution:
        "Hi {name}, the refund left us 10 days ago and was accepted by your card network. Your bank can trace it with this reference (ARN): 74532196081230118857402. Some business cards take up to 15 business days to show refunds, so it may still appear this week.",
      tier: "pro",
    },
    {
      title: "Annual price doesn't match the 17% saving",
      description:
        "Your pricing page says annual gives '2 months free', the upgrade screen says 'Save 17%', and the billing page shows 790.00 USD for annual. Which one is it? And does the discount also apply to extra seats?",
      priority: "low",
      labels: ["Question", "Plan change"],
      note: "Both are right: 158 / 948 = 16.7%. Extra seats are 10 USD a month or 120 USD a year, no annual discount; Chloé suggested the pricing page should say so.",
      resolution:
        "It's the same discount described two ways: two free months out of twelve is 158.00 USD off 948.00, about 17%. Extra seats don't get the annual discount and stay at 120.00 USD per seat per year. I've passed on that the pricing page should say so.",
    },
    {
      title: "Refund for annual plan we bought by mistake",
      description:
        "One of our staff clicked 'Switch to annual' while looking for the invoices page, and we were charged 790.00 USD for Pro annual this morning. We were on monthly and want to stay on monthly, cash flow matters for us.\n\nCan you undo this and refund? It was less than two hours ago.",
      priority: "high",
      labels: ["Question", "Refunds", "Plan change"],
      note: "Charged about three hours ago, nothing used from the annual term. Aisha approved a full refund and switch back. Suggested they take the Billing permission away from staff roles.",
      resolution:
        "Thanks {name}, done: the 790.00 USD is refunded and you're back on Pro monthly, billed on the same date as before. To avoid this in future, you can remove the Billing permission from staff roles in Settings > Staff, so only owners can change the plan.",
      tier: "pro",
    },
    {
      title: "Can we move to invoice and bank transfer billing?",
      description:
        "We're moving to Enterprise next month, the contract is signed with your sales team. Our company policy doesn't allow subscriptions above 1,000 EUR on corporate cards.\n\nCan we get monthly invoices paid by bank transfer, net 30, with our PO number on each? What do you need from us to set that up?",
      priority: "medium",
      labels: ["Question", "Invoices"],
      note: "Enterprise is eligible for `send_invoice` collection. We need legal entity, VAT ID, AP email and PO; Jonas will switch the collection method when the Enterprise subscription starts.",
      resolution:
        "Hi {name}, yes, Enterprise can be billed by invoice with bank transfer on net 30 terms. Please reply with your legal company name, VAT ID, accounts payable email and PO number, and our finance team will set it up so your first Enterprise invoice already arrives that way.",
      tier: "pro",
    },
    {
      title: "Invoice total one cent off from the card charge",
      description:
        "Invoice INV-060144 says 110.46 EUR total, but the card was charged 110.47 EUR. It's one cent, I know, but our accounting software won't auto-match them and I have to fix it by hand. It happened last month too, both times on invoices with a prorated seat line.",
      priority: "low",
      labels: ["Bug", "Invoices"],
      note: "The PDF template rounds VAT per line while the charge rounds on the invoice total, so multi-line invoices with prorated amounts can drift by a cent. Chloé's PR #5176 makes the PDF use Stripe's computed totals.",
      resolution:
        "Hi {name}, you're right, and it's our rounding: the PDF rounds VAT per line while the payment rounds on the total, so invoices with prorated lines can differ by a cent. The fix goes out next week, and after that the invoice total and the charge will always match.",
    },
    {
      title: "Suspended for an invoice we never received",
      description:
        "We are on Enterprise and pay by bank transfer, net 30. This morning our store was suspended for 'invoice overdue'. We never received this invoice: nobody in finance got it, I checked the shared inbox and spam.\n\nIn Billing I now see INV-059930 for 7,200.00 GBP, issued about six weeks ago and sent to someone who left the company months ago. We changed the billing contact long before that. Turn the store back on immediately please, we'll pay today now that we have the invoice.",
      priority: "urgent",
      labels: ["Bug", "Failed payment", "Invoices"],
      note: "Billing contact was updated on the store but never synced to the Stripe customer, so invoices kept going to the old address. Reactivated manually, moved the due date out 14 days, and Jonas synced the email. Checking all Enterprise accounts for the same mismatch.",
      resolution:
        "Hi {name}, your store is back online, and the invoice is now in your finance inbox with a new due date two weeks from today. The contact change you made hadn't reached our invoicing system, which is on us. It's fixed for your account and we're checking every other Enterprise account for the same gap.",
      tier: "enterprise",
    },
    {
      title: "Swiss VAT number format not accepted",
      description:
        "Our Swiss UID CHE-114.582.903 MWST gives `tax_id_invalid_format` in Settings > Billing > Tax details. I copied it exactly from the official UID register. I also tried `CHE-114.582.903` without MWST, same error.\n\nWhich format do you want? Our next invoice is in a week and we don't want Swiss VAT added again.",
      priority: "medium",
      labels: ["Bug", "Tax ID"],
      note: "Validator only accepts `CHE114582903MWST` without dots and dashes, while the Swiss register displays it with them. Normalised theirs by hand; Chloé filed a ticket to strip punctuation before validating.",
      resolution:
        "I've saved your UID in the format our system expects (CHE114582903MWST) and it shows as verified. The form should accept the version with dots and dashes too, and we're fixing that.",
    },
    {
      title: "Our bank disputed your charge by mistake, account locked",
      description:
        "Our bank's fraud team disputed your 69.00 GBP charge as unauthorised without asking us. Now the admin says 'Account on hold: payment disputed' and we can't edit products.\n\nWe've told the bank it was legitimate and asked them to withdraw the dispute. How long until you unlock us? We have a product drop on Thursday.",
      priority: "high",
      labels: ["Question", "Failed payment"],
      note: "Dispute still open in Stripe, reason `fraudulent`. Policy lets us release the hold once the invoice is paid again; sent them a payment link, and Aisha OK'd refunding the duplicate as soon as the dispute closes.",
      resolution:
        "Thanks {name}, since you've paid the 69.00 GBP again through the link I sent, the hold is released and you can edit products as usual. When your bank withdraws the dispute, we'll refund one of the two payments automatically, so you don't need to do anything else.",
      tier: "pro",
    },
    {
      title: "Send our invoices to QuickBooks automatically",
      description:
        "We use QuickBooks Online. Every month I download the Brightcart invoice PDF, upload it into QuickBooks as a bill and match it to the card payment.\n\nAn integration that creates the bill automatically would be great, or at least a way to send the invoice straight to QuickBooks' receipt inbox.",
      priority: "low",
      labels: ["Feature request", "Invoices"],
      note: "No direct QBO bill sync planned, but invoice recipients can include the QuickBooks forwarding address, which covers most of it. Logged the integration request anyway.",
      resolution:
        "You can do most of this today: add your QuickBooks forwarding address as an extra recipient in Settings > Billing > Invoice recipients, and each invoice PDF will land in QuickBooks automatically. A direct integration isn't planned, but I've logged your request.",
    },
    {
      title: "Sales tax for New York on our invoice, we're in Texas",
      description:
        "Our billing address is in Austin, Texas, but invoice INV-060390 charges New York sales tax at 8.875% (7.01 USD). We've never had anything to do with New York.\n\nCan you correct it and tell us if earlier invoices are affected?",
      priority: "medium",
      labels: ["Bug", "Invoices"],
      note: "Tax was calculated from the card's billing ZIP (their bank is in New York) because the address field on the Stripe customer was empty. Copied the address over; only INV-060390 was affected, reissued with Texas tax.",
      resolution:
        "Hi {name}, the invoice has been reissued with Texas sales tax and the difference is refunded to your card; earlier invoices weren't affected. We had calculated tax from your card's billing address instead of your company address, and your company address is now used for all future invoices.",
      tier: "pro",
    },
    {
      title: "Need a full export before we close the shop Friday",
      description:
        "We're closing the shop at the end of this week, the owner is retiring. Before we cancel we need all orders, customers and invoices exported for the tax office, they want 10 years kept.\n\nWhat can we export, and what happens to our data after cancellation? If we cancel on Friday, can we still log in on Monday to download anything we forgot?",
      priority: "high",
      labels: ["Question", "Cancellation"],
      note: "Standard answer: 90 days of read-only access after cancellation, data deleted after that unless they ask sooner. Pointed them to the full account export and offered a ZIP of their Brightcart invoices.",
      resolution:
        "Hi {name}, sorry to hear you're closing. Before you cancel, use Settings > Data > Export everything for orders, customers and products as CSV, and Billing > Invoices for your Brightcart invoices (or ask us and we'll send them as one ZIP). After you cancel, you keep read-only access for 90 days, so you can still log in and download anything you forgot.",
    },
    {
      title: "Store owner left, how do we take over billing?",
      description:
        "Our founder left the company and she was the account owner. We still have admin access, but the Billing page says 'Only the account owner can manage billing' and she is not reachable anymore.\n\nHow do we transfer ownership? Our card expires next month so we need to change it soon.",
      priority: "medium",
      labels: ["Question"],
      note: "Ownership transfer without the current owner needs verification: company register extract plus the request coming from a director. Aisha will do the transfer once the documents are in.",
      resolution:
        "We can transfer ownership without her. Please reply with a document showing you're a director or authorised signatory (a company register extract works) and the email of the new owner. Once we've checked it, we'll make the switch within one business day and you can update the card yourself.",
    },
    {
      title: "Remind us a month before the annual renewal",
      description:
        "Could you send an email a month before the annual renewal? Our finance team needs to budget for it and it catches us by surprise every year.",
      priority: "low",
      labels: ["Feature request"],
      note: "We only send the 7-day upcoming renewal email for annual plans. A 30-day reminder is on the billing notifications list; logged their vote.",
      resolution:
        "Today we send a reminder 7 days before an annual renewal to the billing contact. I've added your vote for an earlier 30-day reminder; it isn't scheduled yet.",
    },
    {
      title: "Reverse charge missing, invoice has 21% VAT",
      description:
        "We're a Dutch company and our VAT ID NL859203417B01 is saved in Billing with a green 'Verified' tick. Still, the last two invoices (INV-057702 and INV-060118) charge 21% VAT, 16.59 EUR each, and don't mention reverse charge.\n\nOur accountant won't book them like this. Please correct both.",
      priority: "high",
      labels: ["Bug", "Tax ID", "Invoices"],
      note: "The subscription cached the customer's tax status as `taxable` before the VAT ID was verified and the renewal never re-read it. Set `tax_exempt: reverse` in Stripe; Jonas is issuing credit notes and reissuing both invoices with the reverse charge text.",
      resolution:
        "Thanks {name}, both invoices have been credited and reissued without VAT and with the reverse charge note, and the 33.18 EUR is refunded to your card. Your VAT ID was verified correctly, but your subscription had kept an older tax setting. Future invoices will be right.",
      tier: "pro",
    },
    {
      title: "Trial ended and we were charged without a reminder",
      description:
        "We started the 14-day Pro trial to test abandoned cart emails and then forgot about it. Today we were charged 69.00 GBP. We never got a reminder that the trial was ending, and we didn't use Pro after the first few days.\n\nCan we have a refund and go back to Free?",
      priority: "medium",
      labels: ["Question", "Refunds"],
      note: "Trial-ending email went out three days before, but likely hit spam: the old billing sender had an SPF alignment problem, fixed last week. Aisha's policy allows refunds for trials that converted without use.",
      resolution:
        "Hi {name}, I've refunded the 69.00 GBP and moved you back to Free; nothing in your store was changed. We did send a reminder three days before the trial ended, but it probably landed in spam because of a sender problem on our side that's now fixed.",
      tier: "pro",
    },
    {
      title: "Invoice still shows your old office address",
      description:
        "Brightcart's own address on our invoices is different from the one in your website footer. Our auditors are asking which one is right.",
      priority: "low",
      labels: ["Bug", "Invoices"],
      note: "Seller address in the invoice template footer wasn't updated after the office move this spring. Jonas updated it in the Stripe account settings; both addresses were valid at the time the invoices were issued.",
      resolution:
        "The website is right: we moved offices this year and the invoice template hadn't caught up. New invoices show the new address. Older invoices with the previous address remain valid, since it was our registered address when they were issued.",
    },
    {
      title: "Prorated charge for two extra seats looks wrong",
      description:
        "We added 2 staff seats halfway through our annual Pro period. The pricing page says extra seats are 120.00 USD per year each, so I expected about 120.00 for both (half a year x 2).\n\nInvoice INV-060587 says:\n\n```\nRemaining time on Extra seat x 2     120.00\nExtra seat x 2                       240.00\nTotal                                360.00 USD\n```\n\nSo we pay for the remaining time AND a full year? Please explain or fix.",
      priority: "medium",
      labels: ["Bug", "Plan change"],
      note: "The seat-add flow invoices immediately and also pulls in the upcoming-period line, which should only be billed at renewal. Voided INV-060587 and reissued at 120.00; Tomás says it's the same bug we had on add-ons last month.",
      resolution:
        "Hi {name}, the second line shouldn't have been there: it's next year's charge for the seats, which belongs on your renewal invoice. I've voided INV-060587, issued a new invoice for 120.00 USD, the correct half-year amount for two seats, and refunded the 240.00 difference to your card.",
      tier: "pro",
    },
    {
      title: "B2B price lists gone, our plan changed to Pro by itself",
      description:
        "Since about 7am all our wholesale customers see retail prices. The B2B price lists section in admin is greyed out with 'Available on Enterprise', and the Billing page says we're on Pro now. Nobody here changed the plan.\n\nWe have 60 trade accounts that order in the morning and they're all getting the wrong prices at checkout. Some have already placed orders at retail.",
      priority: "urgent",
      labels: ["Bug", "Plan change"],
      note: "When their Enterprise quote reached its end date, the contract renewal job re-created the subscription from the default Pro price instead of rolling it over. Restored Enterprise and the B2B features at 08:40; Aisha is talking to Ravi about the orders placed at retail.",
      resolution:
        "Your Enterprise plan and B2B price lists are back, {name}. Our contract renewal process moved your account to Pro by mistake when your quote reached its end date, instead of renewing it. Your account manager will contact you today about the orders that went through at retail prices.",
      tier: "enterprise",
    },
    {
      title: "Sales tax still charged after uploading exemption certificate",
      description:
        "We're a nonprofit in Washington state and uploaded our sales tax exemption certificate in Billing > Tax details three weeks ago. The status says 'Approved'. The invoice we got today still has 10.25% sales tax (8.10 USD).\n\nPlease refund it and make sure the next one is right.",
      priority: "medium",
      labels: ["Bug", "Tax ID"],
      note: "Certificate is approved in our tool, but `tax_exempt` on the Stripe customer is still `none`: the approval webhook to billing-service failed after the auth token rotation. Set it manually and refunded 8.10; Tomás is replaying the other failed approvals.",
      resolution:
        "Your exemption is now active on the billing side as well, and the 8.10 USD is refunded to your card. The approval of your certificate hadn't reached our invoicing system; future invoices won't include sales tax.",
      tier: "pro",
    },
    {
      title: "Let us pause the subscription over winter",
      description:
        "We sell outdoor furniture and during winter we have almost no orders, maybe 5 a month. Paying 79.00 EUR a month for Pro for four months hurts, and downgrading to Free means our custom domain stops working.\n\nCould you add a 'pause' option, like a holiday mode with a small fee?",
      priority: "low",
      labels: ["Feature request", "Cancellation"],
      note: "Third pause request this month from seasonal merchants. 'Seasonal pause' is in discovery; logged theirs with the numbers.",
      resolution:
        "That's a fair request, and you're not the only seasonal shop asking. I've added it to our pause idea with your details; it isn't planned for this quarter. The closest option today is downgrading to Free for the winter: your products and settings are kept, and your domain reconnects as soon as you upgrade again.",
      tier: "pro",
    },
    {
      title: "PO number not printed on invoice, AP rejects it",
      description:
        "We added our purchase order number in Settings > Billing > PO number, as your help article says.\n\nExpected: `PO: PO-4471-BC` on the invoice, like the example in your docs.\nActual: no PO anywhere on INV-060902 (4,800.00 USD), not in the header, not in the notes.\n\nOur AP system rejects every invoice without a matching PO, so this one won't be paid until it's reissued. It's due in 12 days.",
      priority: "high",
      labels: ["Bug", "Invoices"],
      note: "The PO is saved on the account, but the invoice template reads it from the Stripe customer's `custom_fields`, which only sync on address changes. Synced it, voided INV-060902 and reissued as INV-060917 with the PO.",
      resolution:
        "Hi {name}, I've reissued the invoice as INV-060917 with PO-4471-BC under the invoice number, and the old one is voided. The PO you saved hadn't been copied to our invoicing system; it's linked properly now and will appear on every future invoice.",
      tier: "enterprise",
    },
    {
      title: "How do we delete all our data after closing?",
      description:
        "We closed our Brightcart store last month. Under GDPR we want all customer data deleted, not just the store deactivated. What gets deleted, how long does it take, and do we get a confirmation for our records?\n\nWe'll still need the invoices you issued to us.",
      priority: "medium",
      labels: ["Question", "Cancellation"],
      note: "Standard deletion request: store data and shopper PII deleted within 30 days; billing records kept 7 years for tax law. Privacy team sends the confirmation letter.",
      resolution:
        "Thanks {name}, we've started the deletion: all store data, including customer and order information, will be permanently removed within 30 days, and you'll get a written confirmation by email when it's done. The invoices we issued to you are kept for 7 years because tax law requires it, and you can still download them from the link in your cancellation email.",
    },
    {
      title: "Credit for last week's outage under our SLA",
      description:
        "Our storefront was down for about three hours last Tuesday during the platform incident, your status page confirms it. Our Enterprise contract has a 99.95% uptime SLA with service credits.\n\nPlease tell us how the credit is calculated and when it will appear. Our finance team needs it as a separate credit note, not just a lower invoice.",
      priority: "high",
      labels: ["Question", "Refunds"],
      note: "INC-2291 lasted 3h12m for EU storefronts, so 99.56% for the month: below 99.95% but above 99.5%, which is the 5% tier in their contract. Jonas issued CN-00482 for 120.00 EUR; Ravi is in the loop.",
      resolution:
        "The outage lasted 3 hours 12 minutes for your store, which puts last month at 99.56% availability; under your contract that's a 5% credit, 120.00 EUR. Credit note CN-00482 is in Billing > Invoices, and the amount comes off your next invoice.",
      tier: "enterprise",
    },
    {
      title: "Corporate Amex declined on the billing page",
      description:
        'Trying to add our company American Express as the payment method:\n\n1. Settings > Billing > Payment method > Replace card\n2. Enter the Amex (US-issued, corporate)\n3. Click Save\n4. Error: \'Your card was declined.\'\n\nThe network tab shows `{"error":{"code":"card_declined","decline_code":"card_not_supported"}}`. Amex says they see no attempt at all. Our Visa works, but company policy says software subscriptions go on the Amex.',
      priority: "medium",
      labels: ["Bug", "Failed payment"],
      note: "Jonas turned off Amex for EUR accounts in last week's processor config change, and it applied to every currency. Re-enabled for USD and GBP, test card goes through.",
      resolution:
        "Hi {name}, please try again: Amex cards work on the billing page now. A settings change on our side had switched Amex off for every currency by mistake, which is why your bank never saw the attempt.",
    },
    {
      title: "Show the next invoice amount before it's charged",
      description:
        "We added seats and an add-on this month and have no idea what the next invoice will be. Could the billing page show an estimate of the upcoming invoice?",
      priority: "low",
      labels: ["Feature request"],
      note: "Stripe's upcoming invoice endpoint gives this directly, and the billing page redesign already has a 'Next invoice' card in the mockups. Logged their vote.",
      resolution:
        "Good idea, and it's in the designs for our new billing page, though not scheduled yet. For this month, your next invoice will be 138.00 USD: Pro 79.00, 3 extra seats 30.00 and Advanced Reports 29.00.",
      tier: "pro",
    },
    {
      title: "Please support Italian e-invoicing (SDI code)",
      description:
        "In Italy all invoices must go through the SDI system, with codice destinatario or PEC. Your PDF invoices are not enough for our accountant, she have to create an autofattura every month for the reverse charge, which is extra work and cost.\n\nIs it possible to add a field for codice destinatario and send the invoice electronically? I think many Italian shops use Brightcart.",
      priority: "medium",
      labels: ["Feature request", "Invoices", "Tax ID"],
      note: "About 140 Italian merchants. As a non-resident supplier we don't have to issue through SDI, so they self-invoice with a TD17. Logged under 'local e-invoicing'; Aisha says not this half.",
      resolution:
        "Hi {name}, thanks for explaining it so clearly. I've added your request to our e-invoicing item; it isn't planned for this half year, but Italy is the most requested country on it. Until then, our invoices include everything your accountant needs for the TD17 self-invoice.",
    },
    {
      title: "One invoice for all three of our stores",
      description:
        "We run three Brightcart stores (UK, DE, NL), each on Pro, so we get three invoices and three card payments a month. Our finance team would like one consolidated invoice with a line per store, paid in one go.\n\nIs that possible or planned?",
      priority: "medium",
      labels: ["Feature request", "Invoices"],
      note: "Consolidated billing only exists for Enterprise organisations. Ravi says an Enterprise multi-store deal would cost them more than three Pro plans. Logged a +1 on 'consolidated billing for Pro'.",
      resolution:
        "One invoice for several stores is currently only available on Enterprise. I've added your vote for bringing it to Pro; it isn't planned for this quarter. Meanwhile, Settings > Billing > Invoice recipients lets you send all three invoices to the same finance inbox.",
      tier: "pro",
    },
    {
      title: "Still getting payment failed emails after updating card",
      description:
        "I updated our card on Monday and the invoice was paid right away. Since then we got two more 'Your payment failed' emails. Is our account OK?",
      priority: "medium",
      labels: ["Bug", "Failed payment"],
      note: "They paid on the hosted invoice page, which doesn't fire our `dunning.stop` hook, so the sequence kept running. Stopped it by hand; Chloé added the case to the existing hosted-page bug.",
      resolution:
        "Your account is fine and the invoice is paid. The reminders kept going because our system didn't register the payment you made on the payment page. I've stopped them, and you won't get more for this invoice.",
    },
  ],
  threads: [
    {
      title: "Charged Enterprise renewal after we downgraded to Pro",
      description:
        "We scheduled a downgrade from Enterprise to Pro three weeks ago. Since then Settings > Plan has shown 'Your plan changes to Pro at the end of the current term'.\n\nThis morning:\n\n1. Our corporate Visa ending 4417 was charged **28,800.00 USD** for INV-061847, 'Enterprise, annual'.\n2. A few minutes later we received INV-061853, 'Pro, annual', **1,630.00 USD**, marked as paid by a credit of **2,320.00 USD** labelled 'Unused time on Enterprise'.\n3. The billing page now shows a credit balance of **690.00 USD**.\n\nWhat we expected: no Enterprise renewal, and one Pro annual invoice charged to the card.\n\nPlease refund INV-061847 in full and explain the credits. I need a corrected position before our month-end close.\n\nRachel Goldberg\nFinance Director, Harbor & Pine Home",
      priority: "high",
      labels: ["Bug", "Plan change", "Refunds"],
      status: "blocked",
      assigneeId: "aisha-rahman",
      organizationId: "harbor-pine-home",
      quietForHours: 40,
      messages: [
        {
          kind: "internal_note",
          afterMinutes: 20,
          body: "Stripe timeline for their subscription: renewal invoice INV-061847 finalized and paid at 00:00:04 UTC, then the scheduled downgrade (`plan_change` job) ran at 00:05:12 and created INV-061853 plus the 2,320.00 proration credit. So the renewal ran before the scheduled change. Pulling Jonas in to reconcile the credits.",
        },
        {
          kind: "public_reply",
          afterMinutes: 15,
          body: "Hi Rachel, thanks for the precise summary. I can confirm what you're seeing: your downgrade to Pro was scheduled for the end of your Enterprise term, but our renewal ran a few minutes before the change was applied. The Enterprise renewal should never have been charged.\n\nI'm working on this with our finance team now and will send you a full breakdown of the refund and the credits today.",
          statusChange: "in_progress",
        },
        {
          kind: "customer_message",
          afterMinutes: 240,
          body: "Thank you. For context: the 28,800.00 USD charge took the card over its monthly limit, and two supplier payments scheduled on the same card this morning were declined. So this is not only a bookkeeping issue for us.\n\nPlease do not apply the 690.00 USD credit to anything until we understand where it comes from, and tell me today how much will be refunded and when.\n\nRachel",
        },
        {
          kind: "internal_note",
          authorId: "jonas-weber",
          afterMinutes: 210,
          body: "Reconciled. The 2,320.00 'Unused time on Enterprise' credit is 29/30 of the *monthly* Enterprise reference price (2,400.00): proration used the monthly amount instead of the annual one and counted the started day as used. It shouldn't exist at all, since the renewal it prorates should never have been billed.\n\nCorrect position: they owe Pro annual as on INV-061853 (1,630.00) and paid 28,800.00, so 27,170.00 goes back and the 2,320.00 credit is reversed.",
        },
        {
          kind: "internal_note",
          afterMinutes: 40,
          body: "Refunding 20,000.00 now so most of it lands before their close; the rest goes with the corrected invoice so we don't refund against a credit we're about to reverse. Tomás has the ordering bug (renewal job must skip subscriptions with a pending scheduled change) in PR #5241. Flagged to Ravi because of the declined supplier payments.",
        },
        {
          kind: "public_reply",
          afterMinutes: 35,
          body: "Rachel, here is the full picture.\n\n- **INV-061847**, Enterprise annual, 28,800.00 USD: charged in error. It will be credited in full.\n- **2,320.00 USD credit**, 'Unused time on Enterprise': created by the same error when the downgrade was applied right after the renewal. We're reversing it, so please ignore the 690.00 USD balance; it won't be applied to anything.\n- **INV-061853**, Pro annual, 1,630.00 USD: this is the invoice you should have. We'll reissue it as paid from your original charge.\n\nOf the 28,800.00 USD you paid, 27,170.00 USD comes back to you. We've just refunded **20,000.00 USD** to the Visa ending 4417 so most of it is on its way before your close. The remaining 7,170.00 USD follows with the corrected Pro invoice, which I'll send once finance has signed it off.",
        },
        {
          kind: "customer_message",
          afterMinutes: 900,
          body: "Two issues with your breakdown.\n\nFirst, INV-061853 bills 12 seats (5 included + 7 extra at 120.00). We removed two staff accounts as part of the downgrade and have had 10 since then. 790.00 + 5 x 120.00 = 1,390.00, not 1,630.00. That makes the remaining refund 7,410.00, not 7,170.00.\n\nSecond, the 20,000.00 is not on our card account this morning.\n\nI'd appreciate it if the next set of numbers were checked before it is sent to me.\n\nRachel",
        },
        {
          kind: "internal_note",
          afterMinutes: 25,
          body: "Ravi asked for a daily update on this one. He's been working to keep Harbor & Pine after the downgrade and doesn't want this to be what they remember. Jonas is checking the seat count now.",
        },
        {
          kind: "internal_note",
          authorId: "jonas-weber",
          afterMinutes: 100,
          body: "She's right. INV-061853 took the seat quantity from the Enterprise subscription snapshot (12) at renewal time, before the two deactivations synced to the new Pro subscription. With 10 seats Pro annual is 1,390.00, so the remaining refund is 7,410.00. The 20,000.00 refund shows succeeded in Stripe, ARN 74617296034118227164509.",
        },
        {
          kind: "public_reply",
          authorId: "jonas-weber",
          afterMinutes: 180,
          body: "Hi Rachel, I'm Jonas from the finance team, working on this with Aisha. You're right about the seats, and I'm sorry we sent the breakdown without catching it: the Pro invoice copied the seat count from your Enterprise subscription before your two staff changes were applied. The correct Pro amount is **1,390.00 USD**, which makes the remaining refund **7,410.00 USD**.\n\nThe 20,000.00 USD refund left us yesterday and was accepted by Visa. Your bank can trace it with this reference (ARN): `74617296034118227164509`. Refunds to corporate cards usually appear within 5 to 10 business days.",
        },
        {
          kind: "customer_message",
          afterMinutes: 4000,
          body: "Four days after your refund, the 20,000.00 USD is still not on our statement. I have also just learned from our card program administrator that the Visa ending 4417 was cancelled and reissued the afternoon of your charge, because the 28,800.00 tripped the issuer's fraud controls.\n\nWe closed the month with 7,410.00 USD receivable from Brightcart. I need clear answers:\n\n1. Where does a refund to a cancelled card go?\n2. When do we receive the corrected invoice?\n3. When and how do we receive the remaining 7,410.00?\n\nThe two declined supplier payments also cost us 385.00 USD in late fees. We have been going back and forth for most of a week on an error that was not ours.\n\nRachel",
        },
        {
          kind: "public_reply",
          afterMinutes: 40,
          body: "Rachel, understood, and I'm sorry. This was our error from start to finish, and the declined supplier payments are a direct result of it.\n\nI'm confirming with our payment processor exactly how the refund to the cancelled card is routed, and getting the corrected invoice signed off today. You'll have answers to all three questions from me by midday tomorrow at the latest.",
        },
        {
          kind: "internal_note",
          afterMinutes: 60,
          body: "Ravi approved a 385.00 USD goodwill credit to cover the supplier late fees Rachel mentioned, applied on the corrected Pro invoice. Draft INV-062110: Pro annual 790.00 + 5 extra seats 600.00 - goodwill 385.00 = 1,005.00. Remaining refund: 28,800.00 - 20,000.00 - 1,005.00 = 7,795.00. Jonas has a case open with Stripe about the cancelled card.",
        },
        {
          kind: "customer_message",
          afterMinutes: 1635,
          body: "You said midday. It is now half past one. Please send the corrected invoice and a date for the refund today.",
        },
        {
          kind: "internal_note",
          authorId: "jonas-weber",
          afterMinutes: 120,
          body: "Stripe support answered: the 20,000.00 refund was accepted by Visa before the card was closed, so it can't be recalled or redirected. The issuer credits the card account, which normally carries over to the replacement card; their card program admin should ask the issuer with the ARN. For the remaining 7,795.00 she has to choose: the same card route, or a bank transfer, and for a transfer I need account details confirmed by her in writing, not just an email.",
        },
        {
          kind: "public_reply",
          afterMinutes: 35,
          body: "Rachel, sorry for missing the time I gave you. Here is where everything stands.\n\n**Refund of 20,000.00 USD.** Visa accepted it before the card ending 4417 was cancelled, so it can't be recalled or redirected. Your issuer credits it to the card account, which normally carries over to the replacement card. Your card program administrator can ask the issuer to trace it with ARN `74617296034118227164509`.\n\n**Corrected invoice INV-062110**, replacing INV-061853 (in Billing > Invoices):\n\n- Pro annual, 5 seats included: 790.00 USD\n- 5 extra seats x 120.00 USD: 600.00 USD\n- Goodwill credit for your supplier late fees: -385.00 USD\n- **Total: 1,005.00 USD**, paid from your original charge\n\nINV-061847 is credited in full, and the 2,320.00 USD credit has been removed from your account.\n\n**Remaining refund: 7,795.00 USD** (28,800.00 - 20,000.00 - 1,005.00). Because the original card is closed, please tell us where you want it:\n\n1. Back to the Visa ending 4417, routed by your issuer like the first refund, or\n2. By bank transfer to your company account. In that case, please send the account name, bank, routing number and account number on company letterhead, signed by you.\n\nAs soon as you confirm which one and approve INV-062110, Jonas will send the refund the same day.",
          statusChange: "blocked",
        },
      ],
    },
  ],
};
