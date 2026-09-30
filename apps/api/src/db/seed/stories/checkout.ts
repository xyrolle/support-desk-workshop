import type { ProjectStories } from "../story.ts";

export const checkoutStories: ProjectStories = {
  stories: [
    {
      title: "Yen orders charged 100 times the price",
      description:
        "We opened our store to Japan on Monday and the first JPY orders are charged 100 times too much. A customer bought a ¥4,800 tote bag and his card was authorised for ¥480,000. His bank declined it, luckily, but two other orders went through.\n\nSteps:\n1. Switch the storefront to Japan (JPY)\n2. Add SKU TB-2210 (¥4,800) to the cart\n3. Pay with a Visa card on the hosted checkout\n\nExpected: authorisation of ¥4,800\nActual: authorisation of ¥480,000\n\nThe order in our admin shows the correct total, only the payment is wrong. Orders 552031 and 552047 are affected. We have paused Japan in the market settings until this is fixed.",
      priority: "urgent",
      labels: ["Bug", "Payments"],
      note: "JPY is zero-decimal, but the amount builder in checkout-api 3.41 converts every currency to minor units by multiplying by 100. Also hits KRW and CLP, only 4 merchants sell in those. Diego's hotfix is PR #5082 and he's refunding the overcharge on 552031 and 552047.",
      resolution:
        "This is fixed. A change in how we convert amounts for currencies without decimals (JPY, KRW, CLP) multiplied them by 100. We've shipped the fix, refunded the overcharge on 552031 and 552047 so they now show the correct total, and added tests for every zero-decimal currency. You can turn Japan back on whenever you're ready.",
    },
    {
      title: "Klarna disappears for small baskets",
      description:
        "A customer asked us why Klarna doesn't show when the cart is under 35 €. Is this a setting somewhere?",
      priority: "medium",
      labels: ["Question", "Payments"],
      note: "Their Klarna merchant portal has a 35 EUR minimum purchase amount. We only show what Klarna's availability call returns, nothing on our side.",
      resolution:
        "It's a setting in your Klarna account rather than in Brightcart: Klarna only offers itself above the minimum amount configured there, currently 35 €. You can lower it in the Klarna merchant portal under Settings > Payment methods, or ask your Klarna account manager if it's locked.",
    },
    {
      title: "PostNL pickup point map not loading",
      description:
        "The map for choosing a PostNL pickup point is grey, no points on it. Customers can only choose home delivery. This is the second time this month the map is broken.",
      priority: "medium",
      labels: ["Bug", "Shipping"],
      note: "Map tiles API key for the pickup point widget expired, every tile request 403s in the console. Earlier this month it was the same widget but a CSP change. Rotated the key and confirmed on staging and prod.",
      resolution:
        "The pickup point map is working again. The key our pickup point map uses to load its tiles had expired; we renewed it and added an alert that fires well before it expires next time.",
    },
    {
      title: "Logo stretched on hosted checkout",
      description:
        "Our logo looks squashed in the checkout header, wider than it should be. It's a 600x200 PNG.",
      priority: "low",
      labels: ["Bug"],
      note: "Header sets `width: 100%; height: 48px` on the logo img with no `object-fit`. Lena changed it to `object-fit: contain` with a max-width (PR #5117).",
      resolution:
        "The checkout header forced every logo to a set height and the full width, which squashed wide logos like yours. We changed that, and logos now keep their proportions.",
    },
    {
      title: "No GST charged on Australian orders since we registered",
      description:
        "We registered for Australian GST last month and entered our ARN in the tax settings, but checkout still doesn't charge 10% GST to Australian customers. We've had 60+ orders from Australia since then, all without GST, and we'll have to pay that out of our own pocket.\n\nOne strange thing: the tax settings page shows our registration start date with the day and month swapped. Maybe that's why?",
      priority: "high",
      labels: ["Bug", "Taxes"],
      note: "The registration date field parses input as MM/DD whatever the account locale, so their start date landed about a month in the future and the engine correctly skipped GST until then. Corrected the date on their registration; Lena is making the field use the account locale (PR #5156).",
      resolution:
        "Hi {name}, you were right about the date: our form read your start date with day and month swapped, so we treated the registration as starting a month later. We've corrected it and GST is charged on Australian orders now; the date field is being fixed for everyone. For the orders already placed without GST, Reports > Taxes filtered on Australia gives you the totals you need to declare.",
    },
    {
      title: "Webhook payment.succeeded arrives before order.created",
      description:
        "Our fulfilment service listens to your webhooks. Sometimes we receive `payment.succeeded` for an order before `order.created`, so our handler fails because the order doesn't exist in our database yet.\n\nFrom our logs:\n\n```\n12:04:31.882 payment.succeeded order_id=ord_7Hq2 -> 404 order not found\n12:04:32.107 order.created     order_id=ord_7Hq2 -> 200\n```\n\nIs there a guaranteed order of events? If not, what is the recommended way to handle this?",
      priority: "medium",
      labels: ["Question"],
      note: "We don't guarantee ordering, deliveries run in parallel per event type. Every payload has a per-order `sequence` and `created_at`; the 'Delivery guarantees' docs page covers it but it's buried.",
      resolution:
        "Thanks {name}, webhooks are delivered in parallel, so their order isn't guaranteed. Two approaches work well: return a 409 or 503 when you don't know the order yet (we retry with backoff for 24 hours), or fetch it with `GET /v2/orders/:id` when an event arrives for an unknown order. Each event also carries a `sequence` number per order, so you can ignore anything older than what you've already processed.",
    },
    {
      title: "WELCOME10 accepted from returning customers",
      description:
        "Our WELCOME10 code is meant for first orders only, but I see customers with 5+ previous orders using it. I ticked 'Limit to one use per customer' when I created it. What else do we need to do?",
      priority: "medium",
      labels: ["Question", "Promotions"],
      note: "'One use per customer' only stops the same customer using the code twice, it says nothing about first orders. There's a separate eligibility condition, and guests are only matched to existing customers if 'Match guest orders by email' is on, which it isn't here.",
      resolution:
        "Hi {name}, 'one use per customer' stops someone using the code twice, but it doesn't check whether they've ordered before. Edit the code and under Eligibility choose 'Customers with no previous orders', and also turn on 'Match guest orders by email', otherwise a returning customer checking out as a guest looks like a new one.",
    },
    {
      title: "Apple Pay domain verification keeps failing",
      description:
        "We moved our store to a new domain last week and Apple Pay has disappeared from checkout. Under Payments > Apple Pay, 'Verify domain' says `Domain verification failed: file not reachable`.\n\nI uploaded the file from your admin to our web server, in the root folder. What are we missing?",
      priority: "high",
      labels: ["Question", "Payments"],
      note: "Two problems: their server 301s `/.well-known/*` to the `www.` host, which Apple won't follow, and the file was uploaded with a `.txt` extension. curl output pasted in the internal thread.",
      resolution:
        "Hi {name}, two things were in the way. The file has to be served at exactly `/.well-known/apple-developer-merchantid-domain-association` with no `.txt` extension, and your server redirects that path to the `www.` domain, which Apple doesn't follow. Once the file loads without a redirect on the domain shoppers use, click 'Verify domain' again and Apple Pay will show up within a few minutes.",
    },
    {
      title: "Can order numbers have our own prefix?",
      description:
        "We'd like our order numbers to start with 'NK-' so the warehouse can tell our web orders apart from wholesale ones. Possible?",
      priority: "low",
      labels: ["Question"],
      note: "Settings > Checkout > Order numbers has prefix and suffix. Only applies to new orders.",
      resolution:
        "Yes: Settings > Checkout > Order numbers lets you set a prefix like 'NK-', and a suffix if you want one. It applies to new orders only; existing orders keep their numbers.",
    },
    {
      title: "Cart still shows old price after price change",
      description:
        "We lowered the price of our winter coat from €189 to €149 yesterday. Customers who already had it in their cart still see €189 in the cart and at checkout, and they pay €189. New customers see €149.\n\nTwo customers noticed and complained, and they're right to.",
      priority: "medium",
      labels: ["Bug"],
      note: "Cart lines snapshot the price when added and only refresh on quantity change; the reprice-on-load job skips carts older than 24h (performance trade-off from last year). Diego changed checkout to always reprice when a shopper enters it (PR #5191).",
      resolution:
        "Thanks {name}. Carts were keeping the price from when the item was added and only refreshed it in some cases. Checkout now always uses the current price, so anyone who had the coat in their cart pays €149. For the two customers who paid €189, you can refund the €40 difference from their orders.",
    },
    {
      title: "iDEAL bank list is empty, Dutch customers cannot pay",
      description:
        "Since this morning the iDEAL option shows an empty dropdown for the bank. Customers can not choose Rabobank, ING, nothing, so they can't finish the payment. Around 70% of our orders are iDEAL so this is really bad for us.\n\nWe did not change anything in our settings. Cards are still working. Please look at it fast.",
      priority: "urgent",
      labels: ["Bug", "Payments"],
      note: "Merchants migrated to iDEAL 2.0 overnight get an empty issuer list, because bank selection now happens on the iDEAL page, but checkout still renders the old dropdown while `ideal_v2` is off for the store. Flipped `ideal_v2` on for this store; Diego is doing the rest of last night's migration batch.",
      resolution:
        "iDEAL works again. Your account was moved to the new version of iDEAL overnight, where shoppers pick their bank on the iDEAL page itself, but your checkout was still showing the old bank list. We switched your checkout over, so shoppers now go straight to iDEAL and choose their bank there.",
    },
    {
      title: "Shipping cost not taxed on German orders",
      description:
        "Our tax advisor noticed that on German orders the shipping cost (4,90 €) has no VAT. In Germany the shipping follows the VAT of the products, so it should be 19%, or 7% for books. On the invoices the shipping line shows 0% MwSt.\n\nDid we configure something wrong? We checked everything in the tax settings.",
      priority: "medium",
      labels: ["Bug", "Taxes", "Shipping"],
      note: "'Charge tax on shipping' is off on this store, the default for stores created in the US. Engine supports `shipping_tax_mode: proportional` for DE. Chloé thinks it should default on for every EU market; raised it in #checkout-tax.",
      resolution:
        "Thanks {name}. 'Charge tax on shipping' was switched off on your store, which is the default for stores first set up in the US. We turned it on in proportional mode, so shipping on German orders now takes the VAT of the items (19%, 7%, or a split for mixed orders), and invoices from today show it correctly.",
    },
    {
      title: "Shipping method names cut off on mobile",
      description:
        "On mobile, longer shipping method names get cut off, like 'DHL Express - delivery next working d...'. Cosmetic, but it would be nice to see the whole name.",
      priority: "low",
      labels: ["Bug", "Shipping"],
      note: "Option label has `white-space: nowrap` plus ellipsis below 480px. Lena let it wrap to two lines (PR #5122).",
      resolution:
        "Shipping method names now wrap onto a second line on small screens instead of being cut off.",
    },
    {
      title: "Checkout takes 8+ seconds to load on mobile",
      description:
        "Checkout on mobile has become very slow. On 4G it takes 8 to 10 seconds before you can type anything. Desktop on wifi is about 3 seconds, which also used to be faster.\n\nWhat I measured in Chrome DevTools (Moto G Power, 'Fast 4G' throttling):\n- First Contentful Paint: 4.1s\n- Largest Contentful Paint: 8.7s\n- The script `places-autocomplete.js` blocks for ~3s before anything renders\n\nOur mobile checkout conversion went from 2.9% to 2.1% in the last 10 days. We didn't change anything on our side.",
      priority: "high",
      labels: ["Bug", "Performance"],
      note: "Since checkout-web 4.16 the address autocomplete script (410 KB) is injected in `<head>` without `async`, so it blocks render. Lena now lazy-loads it on focus of the address field (PR #5129); mobile LCP p75 on the RUM dashboard is back to ~2.6s.",
      resolution:
        "Thanks for the measurements, they pointed straight at it. Since an update 10 days ago the address autocomplete script was loading before the rest of the page; we now load it only when a shopper starts typing an address. With the same device and throttling we measure LCP around 2.6s again.",
    },
    {
      title: "How can we generate 500 single-use codes?",
      description:
        "We're sending codes to 500 influencers. Each one should have their own code, 15% off, usable once. Creating them one by one in the admin is not realistic.\n\nIs there a bulk option? We also need to see which code was used on which order, for the commissions.",
      priority: "medium",
      labels: ["Question", "Promotions"],
      note: "'Generate unique codes' on the promotion does up to 10k and exports a CSV. Code usage report has `code` and `order_number` columns, which covers the commissions part.",
      resolution:
        "Thanks {name}, there is. Create the promotion as usual, choose 'Generate unique codes' instead of a single code, set the quantity to 500 and 'Uses per code' to 1, and download the codes as a CSV. Reports > Promotions > Code usage shows the order number for each code and can be exported for the commissions.",
    },
    {
      title: "Amex rejected with 'card type not supported'",
      description:
        "A customer tried to pay with American Express and got 'This card type is not supported'. You don't support Amex?",
      priority: "medium",
      labels: ["Question", "Payments"],
      note: "Amex isn't enabled on their Adyen merchant account. The card form accepts any number and only rejects after the BIN lookup, which is why the message comes so late.",
      resolution:
        "Hi {name}, we do support Amex, but it has to be enabled on your payment account first and it isn't on yours yet. You can request it under Settings > Payments > Card brands; it usually takes 2-3 business days while Amex reviews it. In the meantime we've hidden the Amex logo on your checkout so shoppers aren't caught out.",
    },
    {
      title: "Can we add a note to the order confirmation email?",
      description:
        "We want to add a short text to the confirmation email saying that orders placed on Friday ship on Monday. Where can we edit it?",
      priority: "low",
      labels: ["Question", "Emails"],
      note: "'Additional content' block on the order confirmation template, Markdown supported.",
      resolution:
        "Go to Settings > Emails > Order confirmation and use the 'Additional content' block. Text you add there appears under the order summary, and 'Send test email' lets you check it before saving.",
    },
    {
      title: "Blank page after 3-D Secure on Samsung Internet",
      description:
        "Customers using the Samsung Internet browser end up on a white page after approving 3-D Secure in their bank app. The payment is taken and the order exists, but they never see the confirmation page, and some of them order again.\n\nWe've seen it on Galaxy S23 and A54 with Samsung Internet 26. Chrome on the same phones is fine.",
      priority: "high",
      labels: ["Bug", "Payments"],
      note: "Coming back from the bank app, Samsung Internet opens the 3DS return URL in a new tab, and the confirmation page needs `checkout_session` from sessionStorage, which isn't shared across tabs. Sentry issue CHECKOUT-WEB-2K1 has 380 events from SamsungBrowser. Lena put a signed token in the return URL so the page loads without sessionStorage (PR #5181).",
      resolution:
        "When shoppers come back from their bank app, Samsung Internet opens a new tab, and our confirmation page couldn't find the order in it. The page now loads the order from the link itself, so shoppers see their confirmation in any browser.",
    },
    {
      title: "Confirmation email shows $ for AUD orders",
      description:
        "Australian customers get confirmation emails with '$' instead of 'A$', so it looks like US dollars. The order page shows A$ correctly.",
      priority: "medium",
      labels: ["Bug", "Emails"],
      note: "The email renderer's `money` helper formats with the store's default currency instead of the order's presentment currency. Lena fixed the helper (PR #5153), which also covers shipping and refund emails.",
      resolution:
        "Fixed: the confirmation email was formatting amounts with your store's default currency instead of the currency of the order. Australian orders now show A$ in every email, including shipping and refund notifications.",
    },
    {
      title: "One cent difference between checkout tax and our ERP",
      description:
        "Our ERP (Microsoft Dynamics) recalculates tax on every order it imports, and about 5% of orders differ by 0.01 from what Brightcart charged. It's small, but each one breaks the automatic reconciliation and someone has to fix it by hand.\n\nExample, order 440193:\n\n```\nLine 1: 3 x 12.99 EUR, VAT 21%\nLine 2: 1 x 7.49 EUR, VAT 21%\nBrightcart tax_total: 9.75\nERP tax_total:        9.76\n```\n\nIs Brightcart rounding per line or per order? And can we change it?",
      priority: "medium",
      labels: ["Question", "Taxes"],
      note: "We round per line by default (`tax_rounding: line`), Dynamics rounds on the document total. `tax_rounding: order` exists per store but has no admin UI yet; checked with Chloé that it doesn't change their OSS report totals.",
      resolution:
        "Thanks {name}, your example checks out: we round tax on each line (9.75) and your ERP rounds on the order total (9.76). We've switched your store to round on the order total, so new orders will match your ERP; orders placed before today keep line rounding.",
    },
    {
      title: "No shipping options at checkout, UPS rates timing out",
      description:
        "Shoppers with US addresses get 'No shipping options available for this address' at the shipping step and can't continue. Started about 40 minutes ago. We only use UPS for the US.\n\nFrom the checkout debug panel:\n\n```\nshipping.rates.fetch carrier=ups status=timeout elapsed=10002ms\nshipping.rates.result count=0 fallback=none\n```\n\nCanada and UK (DHL) are fine. The live view shows 300+ carts sitting on the shipping step right now. Can you add a flat fallback rate from your side while UPS is down? We can't find where to do it ourselves.",
      priority: "urgent",
      labels: ["Bug", "Shipping"],
      note: "UPS Rating API is timing out on roughly 15% of calls, their status page confirms a degradation. Our rate call has a 10s timeout and this store had no fallback configured. Priya added fallback flat rates ($9.95 Ground, $24.95 2-Day) so carts can move.",
      resolution:
        "UPS had an outage on their rates service, which is why no options came back. While it lasted we added fallback flat rates to your store ($9.95 Ground and $24.95 2-Day) so shoppers could check out. UPS rates are back now, and the fallback only shows if UPS doesn't answer within 10 seconds; you can edit it under Settings > Shipping > Fallback rates.",
    },
    {
      title: "Please add Bancontact for Belgian customers",
      description: "Belgian customers ask us all the time for Bancontact. There is a plan for it?",
      priority: "low",
      labels: ["Feature request", "Payments"],
      note: "Bancontact works through Adyen but only for stores on the new payments stack; this merchant is still on legacy. Added them to next month's migration batch.",
      resolution:
        "Thanks {name}. Bancontact is available on our newer payments setup, and your store is still on the older one. We've added you to next month's migration; once you're moved, you can turn Bancontact on under Settings > Payments.",
    },
    {
      title: "Shoppers lose their cart after 30 minutes",
      description:
        "Our customers are mostly businesses who build a big order over the day, with breaks. If they leave the checkout open for more than 30 minutes they get 'Your session has expired' and have to start again.\n\nCan this time be longer?",
      priority: "medium",
      labels: ["Question"],
      note: "Checkout session TTL is 30 min, but the cart itself lives 30 days and 'Return to cart' rebuilds checkout from it. The message makes it sound like everything is gone. TTL can go up to 4h per store; set it.",
      resolution:
        "Thanks {name}, the cart itself is kept for 30 days; only the checkout page expires, and 'Return to cart' brings everything back. We've raised your checkout session time to 4 hours, the maximum. We're also rewording that message, because 'session expired' makes it sound like the cart is lost.",
    },
    {
      title: "UK checkout adds VAT on top of VAT-inclusive prices",
      description:
        "Our prices are entered including VAT (we're UK based, that's the norm here). Since yesterday, checkout adds 20% VAT on top for UK customers.\n\nExample, order 208814:\n- Product page: £60.00 (inc. VAT)\n- Cart: £60.00\n- Checkout total: £72.00, with a line 'VAT £12.00'\n\nSettings > Taxes > 'Prices include tax' is ticked, I checked twice. EU customers look fine. We've had several complaints and at least 8 people wrote to us about the jump instead of paying.",
      priority: "high",
      labels: ["Bug", "Taxes"],
      note: "Since the markets refactor, 'prices include tax' is read from the market, not the store default, and their UK market was created after they enabled it, so it has `pricesIncludeTax: false`. Fixed their market; Chloé found 3 more merchants with the same mismatch and Priya is running a migration that copies the store default into existing markets.",
      resolution:
        "Thanks {name}. Your UK market had its own 'prices include tax' setting, switched off, and since yesterday's update the market setting wins over the store-wide one. We turned it on, so the UK total for that example is £60.00 again, and we're correcting this for every store. Order 208814 was charged £72.00; you can refund the £12.00 from the order page.",
    },
    {
      title: "Free shipping threshold counts the total before discount",
      description:
        "We give free shipping over £50. A customer had £55 of products, used a 20% code, paid £44 and still got free shipping. Is that how it's supposed to work? We'd prefer the threshold to apply after discounts.",
      priority: "medium",
      labels: ["Question", "Shipping", "Promotions"],
      note: "Threshold is on the subtotal before discounts by default; there's a per-rate option to calculate after discounts.",
      resolution:
        "Hi {name}, yes, by default the free shipping threshold looks at the subtotal before discounts. You can change that per rate: Settings > Shipping, edit the free shipping rate, and under 'Minimum order value' choose 'Calculate after discounts'. The £44 order in your example would then pay shipping.",
    },
    {
      title: "Can we turn off guest checkout?",
      description: "We want every customer to have an account. How do we disable guest checkout?",
      priority: "low",
      labels: ["Question"],
      note: "Checkout > Customer accounts > 'Accounts required'. Worth warning them about conversion.",
      resolution:
        "Under Settings > Checkout > Customer accounts, choose 'Accounts required'. Shoppers will then sign in or create an account before paying. Keep an eye on conversion for a few weeks after switching, since required accounts usually lower it a little.",
    },
    {
      title: "How long does a card authorization stay valid?",
      description:
        "We're starting preorders for a product that ships in about 5 weeks. The idea is to authorize the card at checkout and capture when we ship.\n\nHow long does the authorization stay valid, and what happens if it expires before we capture? We don't want to ship things we can't charge for.",
      priority: "high",
      labels: ["Question", "Payments"],
      note: "Card auths through Adyen are good for about 7 days for Visa/Mastercard here, and the preorder flow never reauthorizes. For 5 weeks they need 'Charge on fulfilment' (saved card, merchant-initiated charge). Diego confirmed.",
      resolution:
        "Thanks {name}, good to ask before launch. Card authorizations usually last about 7 days, so they'd expire long before you ship. For a 5-week preorder, turn on 'Charge on fulfilment' under Settings > Payments > Preorders: we save the card with the shopper's consent at checkout, charge it when you mark the order as shipped, and flag the order if that charge fails.",
    },
    {
      title: "Address autocomplete picks the wrong house number",
      description:
        "In Germany the address autocomplete sometimes drops part of the house number. The customer types 'Hauptstraße 12a', selects the suggestion, and the field then says 'Hauptstraße 12'.\n\nParcels come back because of it. We had 9 returns this month for wrong addresses.",
      priority: "medium",
      labels: ["Bug", "Shipping"],
      note: "Provider returns `house_number: '12a'` correctly, our mapping splits it with `\\d+` and drops suffixes and ranges like '12-14'. Priya fixed the mapping for DE, AT and NL (PR #5170).",
      resolution:
        "Hi {name}, the problem was on our side: when filling in the suggestion we kept only the digits of the house number, so '12a' became '12'. That's fixed for Germany, Austria and the Netherlands, where letter suffixes and ranges like '12-14' are common.",
    },
    {
      title: "Expired code should say expired, not invalid",
      description:
        "When a customer uses an expired code the message is 'This code is not valid'. They think they typed it wrong and try five times. Could it say the code has expired?",
      priority: "low",
      labels: ["Feature request", "Promotions"],
      note: "Engine already returns a reason (`expired`, `usage_limit_reached`, `not_eligible`), storefront maps all of them to one string. Lena estimates a day; on the backlog.",
      resolution:
        "Hi {name}, agreed, that message isn't helpful. We already know why a code is refused and just show one generic text; showing 'This code has expired' (and similar for used-up codes) is on our backlog. No date yet, but your vote is added.",
    },
    {
      title: "Confirmation emails arriving two hours late",
      description:
        "Order confirmations are arriving 1.5 to 2 hours after the order since this morning. Customers think the order failed and order again. Not great.",
      priority: "high",
      labels: ["Bug", "Emails"],
      note: "Transactional emails were stuck behind a 400k-message re-send job for another merchant on the same priority. Priya moved order emails to their own queue; lag on the email queue dashboard back under 30s.",
      resolution:
        "A very large batch of emails from another job was sharing the queue with order confirmations and held them up. Confirmation emails now have a queue of their own and go out within a minute again.",
    },
    {
      title: "Checkout down?? Getting 503s",
      description:
        "Clicking 'Checkout' gives a 503 page since a few minutes, the cart page works. Customers are emailing us. Is something down on your end?",
      priority: "urgent",
      labels: ["Bug", "Performance"],
      note: "Hosted checkout pods in eu-west failed readiness after the 14:05 edge config push (wrong Redis endpoint). Rolled back at 14:21, error rate back to baseline. Incident INC-311, Maya is on the status page.",
      resolution:
        "Checkout is back. A configuration change on our side broke hosted checkout in our EU region for about 16 minutes; we rolled it back and shoppers can pay again. The write-up is on our status page under incident 311.",
    },
    {
      title: "Sales tax wrong for Denver addresses",
      description:
        "Orders shipped to Denver are only charged the Colorado state rate, the city part is missing. We're registered in Colorado and we collect for home-rule cities.\n\nOrder 60317 is an example. Other Colorado cities we checked look right.",
      priority: "medium",
      labels: ["Bug", "Taxes"],
      note: "Denver is home-rule and not in SUTS, so the provider only returns the city portion when the merchant has a Denver license on the Colorado registration. Theirs has no home-rule cities listed. Chloé walked through it with me: config, not a rate bug.",
      resolution:
        "Hi {name}, Denver collects its city tax separately from the state, so we only add it once your Denver license number is on your Colorado registration. Add it under Settings > Taxes > United States > Colorado > Home-rule cities, and Denver orders will include the city tax from then on. Order 60317 had state tax only, so that difference will need to go in your Denver return.",
    },
    {
      title: "Gift message field at checkout",
      description:
        "Can we get a 'Gift message' box at checkout that prints on the packing slip? A lot of our orders are presents.",
      priority: "low",
      labels: ["Feature request"],
      note: "Works today with a custom field (long text) and `order.custom_fields.gift_message` in the packing slip template. Help center article exists.",
      resolution:
        "You can do this today: add a custom checkout field of type 'Long text' called 'Gift message', then add it to your packing slip template under Settings > Documents. The help center article 'Gift messages' walks through both steps.",
    },
    {
      title: "Customers can buy more than we have in stock",
      description:
        "We oversold a product twice this week. SKU LMP-OAK-120 had 3 left and we got 5 orders.\n\nWhat we think happens:\n1. Shopper A adds 2 to the cart and goes to checkout\n2. Shopper B adds 3 to the cart and goes to checkout\n3. Both pay within a minute of each other\n\nExpected: the second shopper sees 'Only 1 left' before paying\nActual: both orders go through and stock goes to -2\n\nInventory tracking is on and 'Allow backorders' is off for this product. These are handmade lamps, we can't just make more in a week.",
      priority: "high",
      labels: ["Bug"],
      note: "Store is still on legacy inventory mode: stock is checked at add-to-cart and at order creation, which for card payments happens after the 3DS round trip, and nothing is reserved at 'Pay'. Switched them to `reserve_on_pay`; Chloé is listing the other legacy stores for a migration.",
      resolution:
        "Hi {name}, your store was still on our older inventory mode, which checks stock when an item goes in the cart but doesn't hold it while the shopper pays. We've moved you to the current mode: stock is reserved when a shopper clicks Pay, so the second shopper now sees 'Only 1 left' instead of being charged.",
    },
    {
      title: "German shoppers receive English confirmation emails",
      description:
        "Our checkout is in German for customers in Germany and Austria, they check out in German, but the confirmation email comes in English. We have the German templates translated (Settings > Emails > Deutsch).\n\nThis used to work. Maybe it stopped when we added the Austria market?",
      priority: "medium",
      labels: ["Bug", "Emails"],
      note: "Checked 20 recent orders: every English email went to an Austrian order. Email locale comes from the market's default language, and their Austria market was created with 'en'. Emails should follow the checkout language instead; Lena has it in PR #5160.",
      resolution:
        "Thanks {name}, it was only your Austrian orders: the Austria market was created with English as its default language, and emails used the market language rather than the one the shopper checked out in. We set Austria to German, and emails will follow the checkout language from the next release.",
    },
    {
      title: "Can we change the order of payment methods?",
      description: "We'd like iDEAL at the top of the list, above cards. Is that possible?",
      priority: "low",
      labels: ["Question", "Payments"],
      note: "Payments > Display order, drag and drop, per market.",
      resolution:
        "Yes: Settings > Payments > Display order. You can drag the methods into any order, per market, so iDEAL can come first for the Netherlands and cards first everywhere else.",
    },
    {
      title: "Klarna refunds not showing for our customers",
      description:
        "We refunded 6 Klarna orders last week from the order page, and Brightcart says 'Refunded'. But customers tell us Klarna still asks them to pay the full amount, and one got a reminder with a late fee.\n\nDid the refunds reach Klarna or not?",
      priority: "high",
      labels: ["Question", "Payments"],
      note: "All 6 refund calls got a 200 from Klarna, but 4 orders were refunded before capture, and Klarna expects a release of the authorization there, so it kept those invoices open. Diego released them by hand; our refund button should release uncaptured Klarna orders, added to the payments backlog.",
      resolution:
        "Hi {name}, 4 of the 6 orders were refunded before they'd been captured, and for those Klarna needs the payment cancelled instead, so it kept the invoices open. We've cancelled them on Klarna's side and the customers' Klarna apps should show nothing to pay within a day. Klarna support can remove the late fee if that customer contacts them, and we're changing the refund button to handle this case itself.",
    },
    {
      title: "Checkout API returns 422 for bundle products",
      description:
        "Adding a bundle to a cart through the Checkout API fails. Normal products work.\n\n```\nPOST /v2/carts/crt_5510/lines\n{ variant_id: 'var_bndl_204', quantity: 1 }\n\n422 Unprocessable Entity\ncode: invalid_line_item\nmessage: Variant var_bndl_204 cannot be purchased directly\n```\n\nThe bundle ('Starter kit', SKU KIT-START) is active, in stock and can be bought on our normal storefront. We're building a headless store on Next.js and bundles are 20% of our revenue, so this blocks our launch in two weeks.",
      priority: "medium",
      labels: ["Bug"],
      note: "Bundles are a parent variant with `purchasable: false`; API v2 expects `bundle_id` on the line and expands the components itself. Our API reference example uses `variant_id`, which is wrong. Asked Diego to make the 422 message point at `bundle_id`.",
      resolution:
        "Bundles are added differently through the API: send `bundle_id: 'bnd_204'` on the line instead of the bundle's variant id, and we add the components for you. Our docs example was wrong about this; we've corrected it, and the 422 message now tells you to use `bundle_id`.",
    },
    {
      title: "Show total savings in the cart",
      description:
        "Could checkout show 'You save €X' when items are on sale or a code is applied? Customers like to see it.",
      priority: "low",
      labels: ["Feature request", "Promotions"],
      note: "Theme setting 'Show savings' only covers the storefront cart; the checkout summary lists discount codes but ignores compare-at savings. Logged.",
      resolution:
        "Thanks {name}. The storefront cart can already show savings (Theme settings > Cart > 'Show savings'), but checkout only lists discount codes, not sale price savings. I've logged your request to show the total there as well.",
    },
    {
      title: "Gift card balance not reduced after partial use",
      description:
        "Customers can use the same gift card again and again. Example: card ending 7Q4M had €50. The customer used €32.40 on order 118402, the balance still shows €50, and she used it again for €45 the next day on order 118519.\n\nWe found 5 cards like this since last week. This is money we're losing.",
      priority: "high",
      labels: ["Bug", "Promotions"],
      note: "When a gift card covers part of the order and PayPal pays the rest, `giftcard.redeem` is skipped because the PayPal capture path doesn't emit `order.paid` in the same transaction. Diego's fix is PR #5163. Pulled the full list for this store: 7 cards, not 5.",
      resolution:
        "Thanks {name}, found it: when a gift card covered part of an order and PayPal paid the rest, the balance wasn't reduced. That's fixed. We found 7 affected cards on your store; we corrected the balances of those that still had money on them, and the attached list shows which ones were overspent and by how much.",
    },
    {
      title: "Payment taken but no order in our admin",
      description:
        "At least 9 customers today were charged (we see the payments in Stripe) but there's no order in Brightcart and they got no confirmation email. Customers are calling us thinking it's a scam.\n\nWhat we checked:\n1. Stripe shows `payment_intent.succeeded` for all 9, amounts from £34.00 to £212.50\n2. The PaymentIntent metadata has `brightcart_checkout_id` set\n3. Searching that checkout id in the admin gives 'Checkout not found'\n\nExample: `pi_3Q8kLm2eZvKYlo2C1x9bT0aa`, £89.00, paid at 11:42 this morning.\n\nWe need to know how many more there are and how to get these orders created so we can ship.",
      priority: "urgent",
      labels: ["Bug", "Payments"],
      note: "Checkout session TTL dropped to 20 min in last week's config change, so the cleanup job expired sessions while shoppers were still on the Stripe redirect; the success callback then fails with `checkout_not_found` and we only log it. Diego raised the TTL back to 3h and backfilled orders from the Stripe events: 27 orders across 5 merchants, 11 of them here.",
      resolution:
        "We found and fixed it. A timeout on our side expired checkouts while shoppers were still paying, so the payment went through but the order was never created. We recreated all 11 affected orders from your Stripe payments (tagged `recovered` in your admin) and sent their confirmation emails; there are no others.",
    },
    {
      title: "Books charged 23% VAT in Ireland",
      description:
        "We sell books and Irish customers are charged 23% VAT. Books are 0% in Ireland. The products have the tax category 'Books (printed)', so I don't understand. Orders to Germany get 7%, which is correct.\n\nIt's been maybe two weeks, around 40 orders.",
      priority: "medium",
      labels: ["Bug", "Taxes"],
      note: "The IE row for `books_printed` went missing in the last rate table import and fell back to standard. DE, FR, NL fine. Priya restored it and added a test over every category and EU country pair.",
      resolution:
        "Hi {name}, our rate table lost the Irish rate for printed books in a recent update, so it fell back to 23%. It's corrected, Irish book orders are at 0% again, and we added checks so a missing rate can't slip through. For the 40 orders already placed, you can refund the VAT from each order page, or send us the list and we'll do it in bulk.",
    },
    {
      title: "Test cards declined in sandbox",
      description:
        "Using the test card 4242 4242 4242 4242 in our sandbox store, it's declined. Which test cards should we use?",
      priority: "low",
      labels: ["Question", "Payments"],
      note: "4242 is a Stripe test card; their sandbox runs on Adyen.",
      resolution:
        "Your sandbox uses Adyen, and 4242 4242 4242 4242 is a Stripe test card. Use the Adyen cards listed under Developers > Testing > Test cards, for example 4111 1111 4555 1142 with CVC 737 and any future expiry date.",
    },
    {
      title: "429 errors on cart API during product launch",
      description:
        "Our headless storefront calls the Checkout API for cart updates. During yesterday's launch we got a lot of 429s:\n\n```\nPOST /v2/carts/crt_91JX2/lines -> 429 Too Many Requests\nerror=rate_limited retry_after=2\n```\n\nPeak was around 900 requests per second from our backend. Questions:\n1. What is our rate limit exactly? The docs only say 'fair use' and our Enterprise contract doesn't give a number.\n2. Is it per API key or per IP? All our calls come from 3 servers.\n3. Can it be raised for launches? We have another one in three weeks.",
      priority: "high",
      labels: ["Question", "Performance"],
      note: "Default Enterprise limit: 300 req/s per API key, token bucket with burst 600. They use one key across all 3 servers. Diego is fine with a `rate_limit_override` of 1,000 req/s for launch windows if they tell us ahead.",
      resolution:
        "Your limit is 300 requests per second per API key, with bursts up to 600, and it's counted per key, not per IP, so your three servers share it. We can raise it to 1,000 per second for launches; send us the time window a few days ahead. Separately, sending all lines in one `PUT /v2/carts/:id/lines` call instead of one call per line cut traffic a lot for other headless stores.",
      tier: "enterprise",
    },
    {
      title: "Promo codes fail when typed in lowercase",
      description:
        "Customers who type 'summer15' instead of 'SUMMER15' get 'This code is not valid'. Surely codes shouldn't be case sensitive?",
      priority: "medium",
      labels: ["Bug", "Promotions"],
      note: "The promotions DB migration dropped the `lower(code)` index and lookup has been exact since. Diego put case-insensitive lookup back (PR #5134).",
      resolution:
        "Hi {name}, agreed, and it used to work that way. A recent change made code lookup case sensitive by mistake. It's fixed, so summer15, Summer15 and SUMMER15 all work now.",
    },
    {
      title: "UK shoppers see 'Tax' instead of 'VAT'",
      description:
        "The tax line at checkout says 'Tax' for UK customers. Should be 'VAT'. Small thing, but it looks American.",
      priority: "low",
      labels: ["Bug", "Taxes"],
      note: "Label comes from locale `en` (US) because the UK market uses `en` rather than `en-GB`. Lena mapped the tax label to VAT for GB and IE.",
      resolution: "UK and Irish shoppers now see 'VAT' at checkout and in emails.",
    },
    {
      title: "Swiss VAT still calculated at 7.7%",
      description:
        "Checkout charges 7.7% VAT on Swiss orders. The standard rate is 8.1% now. Please fix, our accountant is not happy.",
      priority: "high",
      labels: ["Bug", "Taxes"],
      note: "Our rate table has 8.1%, but the store has a manual CH override at 7.7% from 2023, and overrides win. Removed it after the merchant OK'd by email.",
      resolution:
        "Your store had a manual rate of 7.7% for Switzerland, set up a while ago, which overrides our built-in rates. We removed it, so Swiss orders now use 8.1% and will follow future rate changes automatically. Manual rates live under Settings > Taxes > Custom rates if you ever need one again.",
    },
    {
      title: "Delivery estimate counts Sundays",
      description:
        "Checkout says 'Delivered by Monday' for orders placed on Friday afternoon with Standard (2-3 working days). That's impossible, DPD doesn't deliver at the weekend here. Customers then complain when the parcel arrives on Wednesday.",
      priority: "medium",
      labels: ["Bug", "Shipping"],
      note: "Their custom 'Standard' rate isn't linked to a carrier, and without a carrier calendar the estimate counts calendar days. Priya changed the fallback to business days (PR #5195).",
      resolution:
        "Thanks {name}. Your 'Standard' rate isn't linked to a carrier, and in that case our estimate counted calendar days. It now counts working days by default, so a Friday order shows Wednesday. You can also link the rate to DPD under Settings > Shipping to use DPD's own calendar, including public holidays.",
    },
    {
      title: "Let automatic discounts stack with codes",
      description:
        "We run an automatic '10% off 3 or more items' promotion. When a customer enters a newsletter code on top, the automatic discount disappears and only the code is applied.\n\nWe'd like to allow both, at least for some codes. Could this be added?",
      priority: "low",
      labels: ["Feature request", "Promotions"],
      note: "Current rule is one automatic discount or one code per order. Discount combinations are scoped for next quarter on the promotions roadmap; added this store to the early access list.",
      resolution:
        "Thanks {name}. Right now an order gets either an automatic discount or a code, not both. Combining them, with a setting per promotion for what can stack, is planned for next quarter, and I've put your store on the early access list.",
    },
    {
      title: "Klarna orders never send payment.succeeded webhook",
      description:
        "Our ERP only ships an order when it receives `payment.succeeded`. For Klarna orders it never comes, so they sit in 'awaiting payment' and we ship them manually.\n\nWebhook log for a Klarna order (order 330915):\n\n```\norder.created        200  delivered\npayment.authorized   200  delivered\npayment.succeeded    -    not sent\n```\n\nFor card orders all three are sent. About 40 Klarna orders a day get stuck like this. Is Klarna supposed to send a different event?",
      priority: "high",
      labels: ["Bug", "Payments"],
      note: "Working as intended but badly documented: Klarna Pay Later is captured on fulfilment, so `payment.succeeded` only fires after shipping, and their ERP waits for it before shipping. Chloé is adding a Klarna section to the webhook guide.",
      resolution:
        "Hi {name}, this is how Klarna works, though our docs don't explain it well. Klarna payments are captured when you mark the order as fulfilled, so `payment.succeeded` comes after shipping, not before. For Klarna orders, have your ERP ship on `payment.authorized`, since Klarna guarantees the payment at that point. We're updating the webhook guide to say this clearly.",
    },
    {
      title: "All card payments failing with processor_unavailable",
      description:
        "Since ~20 min every card payment fails with `processor_unavailable`. PayPal still works. Our Friday sale started an hour ago, please help!!",
      priority: "urgent",
      labels: ["Bug", "Payments"],
      note: "Adyen rotated the certificate chain on the live endpoint for EU accounts and our payments gateway pins an intermediate that wasn't in the new chain. Diego shipped the updated CA bundle at 10:52; card success rate back to 97%.",
      resolution:
        "Card payments are working again. Our payment provider changed a security certificate and our gateway didn't accept the new one, so card payments failed for about 35 minutes. We've updated it and added an alert for this; PayPal orders weren't affected.",
    },
    {
      title: "Why no DHL Express rates for the Canary Islands?",
      description:
        "Customers in Tenerife and Gran Canaria see 'No shipping options' at checkout. We ship with DHL Express to all of Spain and mainland Spain works fine. Is this a problem with DHL or with Brightcart?",
      priority: "medium",
      labels: ["Question", "Shipping"],
      note: "Canaries are outside the EU VAT area, so DHL Express needs customs data (HS code, country of origin) in the rate request. None of their products have HS codes, DHL answers with no products available.",
      resolution:
        "Thanks {name}. The Canary Islands count as outside the EU for customs, so DHL needs customs information to quote a rate, and your products don't have HS codes or a country of origin yet. Add them under Products > Shipping > Customs information, or in bulk with the `hs_code` and `country_of_origin` CSV columns, and the rates will appear. Shoppers there may also pay local tax (IGIC) on delivery, which is worth mentioning on your shipping page.",
    },
    {
      title: "Can we use our own font on checkout?",
      description:
        "Our brand font isn't in the font list of the checkout editor. Can we upload our own? We're on the Free plan for now.",
      priority: "low",
      labels: ["Question"],
      note: "Custom font upload (WOFF2, Checkout > Branding > Fonts) is Pro and Enterprise only, and they're on Free. Pointed them at the closest fonts in the list.",
      resolution:
        "Uploading your own font is part of the Pro and Enterprise plans: there you can add WOFF2 files under Settings > Checkout > Branding > Fonts, as long as you hold a web license for the font. On the Free plan the checkout uses the fonts in the editor's list, which covers the most common brand typefaces.",
      tier: "free",
    },
    {
      title: "No confirmation email for PayPal orders",
      description:
        "Customers who pay with PayPal don't get an order confirmation email. Card orders get it fine. In the order timeline in admin, PayPal orders have 'Payment captured' but no 'Confirmation email sent' line.\n\nThis started maybe 3-4 days ago. We get a lot of 'did my order go through?' emails now.",
      priority: "high",
      labels: ["Bug", "Emails", "Payments"],
      note: "Since the capture refactor in checkout-api 3.39, PayPal captures move the order to `paid` through a path that never enqueues the confirmation email. Fix in PR #5118; Priya re-sent emails for 1,240 affected orders across all merchants.",
      resolution:
        "PayPal orders get their confirmation email again. A change in how we record PayPal payments skipped the email step; it's fixed, and we re-sent the missing confirmations for your PayPal orders from the last four days.",
    },
    {
      title: "Webhook retries flooded our endpoint after downtime",
      description:
        "Our endpoint was down for 3 hours during a server migration. When it came back we received about 18,000 webhook retries within a few minutes and it went down again.\n\nCan you limit how fast retries are sent? Or can we pause webhooks during maintenance?",
      priority: "medium",
      labels: ["Question"],
      note: "Backoff is per event, so after a long outage everything comes due at roughly the same time. Set `max_concurrency: 10` on their endpoint, which isn't exposed in the UI yet. Pause/resume is in the UI for all plans.",
      resolution:
        "Hi {name}, retries are spaced out per event, but after a long outage they all come due at about the same time. We've limited your endpoint to 10 deliveries at once, which would spread a backlog like that over roughly 20 minutes. For planned maintenance you can also pause the endpoint under Developers > Webhooks; events are kept for 72 hours and delivered when you resume.",
    },
    {
      title: "Apple Pay button on the cart page too",
      description:
        "Could we have the Apple Pay button directly on the cart page, like many other shops? Now shoppers have to go to checkout first.",
      priority: "low",
      labels: ["Feature request", "Payments"],
      note: "Already exists: Express checkout > 'Show on cart page', off by default.",
      resolution:
        "Good news, this already exists: turn on Settings > Checkout > Express checkout > 'Show on cart page'. It adds Apple Pay, Google Pay and PayPal buttons to the cart, each shown only on devices that support it.",
    },
    {
      title: "Google Pay button missing on Android",
      description:
        "Google Pay doesn't show on checkout for Android users anymore, only cards and PayPal. It's enabled in our payment settings. Since the weekend.",
      priority: "high",
      labels: ["Bug", "Payments"],
      note: "Weekend settings migration blanked the Google Pay gateway merchant id for 40 stores, so `isReadyToPay` returns false and the button never renders. Diego restored the ids from the pre-migration snapshot.",
      resolution:
        "Google Pay is back on your checkout. A settings migration over the weekend cleared an ID that Google Pay needs, so Google hid the button. We restored it for your store and every other store affected.",
    },
    {
      title: "Why do Canadian visitors see prices in USD?",
      description:
        "We added Canadian dollars as a currency last month, but customers in Canada still see USD on the product pages and at checkout. One customer paid in USD and her bank charged her a foreign transaction fee, which she wasn't happy about.\n\nIs there another setting we need to turn on?",
      priority: "medium",
      labels: ["Question"],
      note: "CAD is in their currency list, but Canada still sits in their 'United States' market, which is USD. Needs its own market.",
      resolution:
        "Adding a currency makes it available, but each country uses the currency of the market it belongs to, and Canada is still in your United States market. Create a Canada market under Settings > Markets and set its currency to CAD; prices and checkout switch within a few minutes.",
    },
    {
      title: "Remember last shipping method for returning customers",
      description:
        "Returning customers always have to pick the shipping method again, and the default is Standard. Most of our regulars use Express. Could checkout preselect what they chose last time?",
      priority: "low",
      labels: ["Feature request", "Shipping"],
      note: "Checkout always preselects the cheapest rate, no per-customer memory. Lena thinks we could reuse the last order's rate if it's still offered; small, added to the backlog.",
      resolution:
        "Hi {name}, nice idea. Today checkout always preselects the cheapest option; I've added remembering the last choice to our backlog as a small improvement, no date yet.",
    },
    {
      title: "Firefox shoppers stuck on 'Something went wrong' at payment",
      description:
        "Some shoppers on Firefox can't pay. After entering card details and clicking Pay they see 'Something went wrong. Please try again.' Retrying doesn't help.\n\nI could reproduce it:\n1. Firefox 131 on Windows, Enhanced Tracking Protection set to 'Strict'\n2. Add anything to the cart, go to checkout, pay by card\n3. The error appears after ~2 seconds\n\nWith tracking protection on 'Standard' it works. The console shows:\n\n`Uncaught TypeError: window.bcRisk is undefined`\n\nFirefox is 11% of our traffic. I don't know how many use Strict, but we got 6 emails about it yesterday.",
      priority: "high",
      labels: ["Bug", "Payments"],
      note: "Strict ETP blocks our device fingerprint script from `risk.brightcart.example` (it's on the Disconnect list), and the submit handler calls `window.bcRisk.collect()` without a guard. Lena added the guard so we submit without the device signal and the risk check scores it as 'no fingerprint' (PR #5176).",
      resolution:
        "Thanks for the reproduction steps, {name}, they made this quick. Firefox's strict mode blocks one of our fraud-check scripts, and our Pay button didn't cope with that. Payments now go through when that script is blocked, and we tested it with Enhanced Tracking Protection on Strict.",
    },
    {
      title: "Checkout timing out during our 10:00 sneaker drop",
      description:
        "Our limited drop went live at 10:00 and checkout fell over within two minutes. Shoppers get stuck on 'Placing your order…' and then:\n\n`Error CHK-5004: The request took too long. Please try again.`\n\nWhat we know:\n- ~6,000 people in the queue page, we let 400 through per minute like your docs recommend\n- Cart and shipping steps load fine, it's the final 'Pay now' that hangs\n- Some shoppers retried and now we don't know if they have orders or not\n\nThis is our biggest drop of the quarter, our account manager knew about it weeks ago, and people are posting screenshots on Instagram. We need someone on this now.",
      priority: "urgent",
      labels: ["Bug", "Performance"],
      note: "Pay now hangs on `inventory.reserve`: one product with 12 sizes, and every order locks the product row, so all checkouts queue on a single lock. p99 went from 80ms to 28s. Diego enabled `inventory_variant_locks` for the store at 10:14 and the queue drained.",
      resolution:
        "The slowdown came from how we reserved stock: all sizes of the sneaker shared one lock, so thousands of orders waited behind each other. We switched your store to reserving stock per size, which is what we now use for every high-traffic drop. We also checked every payment between 10:00 and 10:20: nobody was charged without getting an order.",
      tier: "enterprise",
    },
    {
      title: "Cart page freezes with 80+ line items",
      description:
        "We're a B2B wholesaler and our customers often order 80 to 150 different SKUs. Above about 80 lines the cart page freezes for several seconds every time you change a quantity. Sometimes Chrome says 'Page unresponsive'.\n\nTo reproduce:\n1. Add 100 different products to the cart (our CSV quick-order upload does this)\n2. Open the cart\n3. Change the quantity of any line\n\nExpected: the total updates in under a second\nActual: 6-9 seconds frozen, then it updates\n\nWith 20 lines it's instant.",
      priority: "medium",
      labels: ["Bug", "Performance"],
      note: "Each quantity change re-renders every line and calls `evaluatePromotions` once per line, so it's quadratic. Chrome profile: 8.1s for 120 lines. Lena memoized the lines and batched promotions into one call (PR #5185), now ~250ms.",
      resolution:
        "Thanks for the clear steps. Every quantity change recalculated discounts line by line, which got slow quickly with big carts. We now do one calculation for the whole cart; with 120 lines a quantity change takes about a quarter of a second.",
    },
    {
      title: "UK postcode rejected without a space",
      description:
        "If a customer types 'SW1A1AA' without the space, the postcode is rejected. 'SW1A 1AA' works. Most people don't type the space on mobile.",
      priority: "low",
      labels: ["Bug", "Shipping"],
      note: "GB regex in the country pack requires the space. Priya now normalizes first (strip spaces, insert one before the last 3 characters).",
      resolution:
        "Fixed: UK postcodes are accepted with or without the space, and we add it automatically so labels and exports stay consistent.",
    },
    {
      title: "Fraud check blocking lots of orders from Norway",
      description:
        "Since last week about 1 in 4 orders from Norway is blocked with 'Payment declined: risk check'. These are normal customers, many of them returning ones. Our Norway sales are down 30%.\n\nExamples: 71832, 71840, 71857. All paid with Norwegian Visa cards and shipping to Norwegian addresses.",
      priority: "high",
      labels: ["Bug", "Payments"],
      note: "The risk model weighs 'billing country differs from IP country' heavily, and after the IP data vendor's last update Telenor mobile users in Norway geolocate to Sweden. Diego lowered the weight for NO/SE mismatches and opened a ticket with the vendor.",
      resolution:
        "The blocks came from our fraud check misreading where Norwegian mobile shoppers are: a data update placed many of them in Sweden, which looked like a mismatch with their card. We corrected the rule, and the three orders you sent would pass now, so those customers can simply try again.",
    },
    {
      title: "How do we mark a customer as tax exempt?",
      description:
        "A school district orders from us and is tax exempt. They sent us their certificate. How do we stop charging them sales tax at checkout?",
      priority: "medium",
      labels: ["Question", "Taxes"],
      note: "Customer-level exemptions: Customers > customer > Tax exemptions, with certificate number and states.",
      resolution:
        "Open the customer under Customers, then Tax exemptions > Add exemption, pick the states and enter the certificate number (you can attach the PDF too). From then on checkout won't charge them sales tax when they're signed in, and the exemption number is printed on their invoices.",
    },
    {
      title: "BCC order confirmations to our warehouse",
      description:
        "Could we add a BCC address to order confirmation emails? Our warehouse wants a copy of every one.",
      priority: "low",
      labels: ["Feature request", "Emails"],
      note: "No BCC on customer emails, for deliverability and privacy. The staff 'New order' notification covers exactly this.",
      resolution:
        "We don't add BCC to customer emails, but the staff 'New order' notification does what your warehouse needs: add their address under Settings > Notifications > Staff notifications and they'll get an email with the full order for every purchase.",
    },
    {
      title: "SEPA Direct Debit orders pending for a week",
      description:
        "We have 23 orders paid with SEPA Direct Debit that are still 'Payment pending' after 6 to 8 days. Our finance team asks if we will get this money or not. Total is 4.380,00 €.\n\nIs this normal? How long should SEPA take?",
      priority: "high",
      labels: ["Question", "Payments"],
      note: "All 23 mandates are with the same bank, and our PSP had a delay on that bank's returns file. Overnight 19 settled and 4 came back with `AC04` (account closed). Diego confirmed nothing was stuck on our side.",
      resolution:
        "Hi {name}, SEPA Direct Debit normally takes 2 to 5 working days, but a delay on the banks' side held these back. As of this morning 19 of the 23 orders are paid. The other 4 were returned by the customer's bank as 'account closed' (code AC04), so those orders are now 'Payment failed' and you'll want to contact those customers.",
    },
    {
      title: "GA4 purchase event fires twice",
      description:
        "Google Analytics shows about double the purchases we really have. In GA4 DebugView the `purchase` event fires twice on the order confirmation page, with the same `transaction_id`.\n\n1. Place a test order\n2. Watch DebugView\n3. Two `purchase` events, about 1 second apart\n\nWe use your built-in integration (Settings > Integrations > Google Analytics), nothing added by hand in the theme. Our marketing reports are useless right now.",
      priority: "medium",
      labels: ["Bug"],
      note: "Confirmation page fires `purchase` on mount and again when the order status poll flips to 'paid'. Lena guarded it with a per-order flag in sessionStorage (PR #5132).",
      resolution:
        "That one was on our side: the confirmation page sent the purchase event once when it loaded and again when the payment was confirmed. It now sends it once per order. GA4 can't remove duplicates it has already recorded, so purchase counts since the new checkout went live will stay inflated.",
    },
    {
      title: "Buy one get one discount goes to the cheaper item?",
      description:
        "With our 'Buy 2, get 1 free' promotion, which item becomes free if they have different prices? A customer says it should be the most expensive one.",
      priority: "low",
      labels: ["Question", "Promotions"],
      note: "Engine discounts the lowest-priced qualifying item by default, configurable per promotion.",
      resolution:
        "The cheapest qualifying item is the free one; that's the default and what most stores use. If you'd rather make it the most expensive, change 'Which item is discounted' in the promotion settings, though it makes the promotion quite a bit more costly for you.",
    },
    {
      title: "3-D Secure challenge cut off on small phones",
      description:
        "Customers with smaller phones can't finish the 3-D Secure step. The bank's challenge window is cut off at the bottom, so the 'Confirm' button isn't visible and you can't scroll inside it.\n\nSteps:\n1. iPhone SE (2nd gen), or any Android with a 360px wide screen\n2. Pay with a card that triggers a challenge (we tested with our own Barclays card)\n3. The challenge opens in the modal\n\nExpected: the whole challenge is visible or scrollable\nActual: the bottom ~120px is hidden, no scrolling\n\nWe see a lot of abandoned checkouts at this step in GA since the new checkout design went live. Screenshot attached.",
      priority: "high",
      labels: ["Bug", "Payments"],
      note: "Since the redesign the 3DS modal sets a fixed `height: 600px` with `overflow: hidden` on the iframe container, and the Barclays ACS page is 640px tall. 3DS abandonment on screens under 400px went from 6% to 19% after the redesign. Lena made it fill the viewport and scroll (PR #5093).",
      resolution:
        "Thanks for the screenshot and steps, {name}. The new checkout design gave the 3-D Secure window a fixed height, so longer bank pages were cut off on small screens. It now uses the full screen height and scrolls, and we tested it on an iPhone SE and several small Android phones.",
    },
    {
      title: "Discount code giving 100% off instead of 10%",
      description:
        "One of our codes, AUTUMN10, is giving customers 100% off. We only noticed because the warehouse asked why 14 orders had a total of 0,00 €. We edited the code yesterday in the new promotions screen (only changed the end date) and I think that's when it started.\n\nI've disabled the code for now. Please tell us how many orders are affected, we cannot ship all of these for free.",
      priority: "urgent",
      labels: ["Bug", "Promotions"],
      note: "The new promotions editor displays the stored `0.1` as 10 and posts the display value back on save, so the engine gets 10 and clamps it to 100%. Only codes edited since Tuesday's release: 6 codes across 4 merchants. Lena has the fix in PR #5127; I exported the 14 orders for the merchant.",
      resolution:
        "Thanks {name}, the new promotions editor had a bug that turned a 10% code into 100% when any other field was edited. It's fixed and AUTUMN10 is back to 10% if you want to re-enable it. The 14 orders placed with the broken code are in the attached list; if you decide to cancel any of them, we can help you do it in bulk.",
    },
    {
      title: "How do we let a fraud-flagged customer through?",
      description:
        "One of our best B2B customers keeps getting declined by the risk check. They place big orders (€3,000 to €6,000) with a company card, shipping to a different address than billing, which I guess looks suspicious. They've ordered from us for 3 years.\n\nIs there a way to whitelist them?",
      priority: "medium",
      labels: ["Question", "Payments"],
      note: "Allow list takes email, customer id or card fingerprint; for B2B the customer id is the safest. Chloé confirmed allow-listed orders still go through 3DS.",
      resolution:
        "Thanks {name}, you can add them under Settings > Fraud > Allow list, by customer account rather than email, which is easier to fake. Their orders then skip the risk score but still go through 3-D Secure when their bank asks for it, so you keep that protection.",
    },
    {
      title: "Payment section jumps down while the page loads",
      description:
        "When checkout loads, the payment section appears and then jumps down about 200px once the Apple Pay and Google Pay buttons load above it. A few customers told us they tapped the wrong thing because of it. Lighthouse gives the checkout page a CLS of 0.31.",
      priority: "low",
      labels: ["Bug", "Performance"],
      note: "Express checkout buttons render async with no reserved space. Lena now reserves the container height when any express method is enabled (PR #5199); local Lighthouse CLS 0.02.",
      resolution:
        "The express payment buttons loaded after the rest of the page and pushed everything down. We now reserve their space from the start, and Lighthouse shows a CLS of 0.02 on your checkout.",
    },
    {
      title: "Scheduled sale started an hour late",
      description:
        "We scheduled our weekend sale to start at 00:00 on Saturday. It started at 01:00. Our email campaign went out at midnight, so for an hour people clicked through and saw full prices. Lots of angry replies.\n\nOur store time zone is Europe/London. Did the scheduler use the wrong time zone?",
      priority: "high",
      labels: ["Bug", "Promotions"],
      note: "Scheduler stores the start as UTC using the offset at save time, and they saved it before the clocks changed. Priya is switching to local time plus time zone name (PR #5188). 19 other promotions were saved across a clock change; Chloé is emailing those merchants.",
      resolution:
        "Thanks {name}. The sale was saved before the clocks changed, and our scheduler kept the old UTC offset instead of following your store's time zone, so it started an hour late. That's fixed for every scheduled promotion, including ones already saved, so future sales start at the local time you set.",
    },
    {
      title: "Flat surcharge per item for oversized furniture?",
      description:
        "We sell sofas and dining tables, and also small things like cushions. The carrier charges us a €45 surcharge per bulky item. How can we add that at checkout per bulky item without it applying to cushions? Our weight-based rate doesn't cover it and we lose money on every sofa.",
      priority: "medium",
      labels: ["Question", "Shipping"],
      note: "Shipping profiles with a per-item surcharge do exactly this. They're on Pro, which includes profiles, so no upgrade needed.",
      resolution:
        "Thanks {name}, this is what shipping profiles are for. Create a profile called 'Bulky' under Settings > Shipping > Profiles, add your sofas and tables to it and set a per-item surcharge of €45; everything else keeps your normal rates. The surcharge is included in the shipping price at checkout, so shoppers see it before paying.",
      tier: "pro",
    },
    {
      title: "Add tax breakdown per jurisdiction to order webhook",
      description:
        "The `order.created` webhook has `tax_total` and `tax_lines[]` with rate and amount, but not the jurisdiction (state, county, city). For US orders our accounting system needs that split to file returns.\n\nRight now we call your tax API again for every order to get it, which is slow. Could the jurisdiction be included?",
      priority: "low",
      labels: ["Feature request", "Taxes"],
      note: "Tax engine stores `jurisdiction.type/name/code` per tax line, the webhook serializer just drops it. Diego says it's additive and safe; queued for API v2.4.",
      resolution:
        "Thanks {name}, that makes sense, and we already have the jurisdiction for each tax line; it just isn't in the webhook. Adding it to `tax_lines[]` is planned for the next API version next quarter, and it will be listed in the API changelog when it ships.",
    },
    {
      title: "Our custom CSS is gone after the update",
      description:
        "After yesterday's checkout update our custom CSS is not applied anymore. Our checkout is back to the default blue buttons and the wrong font. The CSS is still there in the settings.",
      priority: "high",
      labels: ["Bug"],
      note: "The new checkout theme renders inside a shadow root, and custom CSS is still injected into the document head, so it never reaches the elements. Lena now injects it into the shadow root (PR #5144). `.bc-*` selectors still match; a few merchants used ids we renamed.",
      resolution:
        "Your custom CSS is applied again. Yesterday's update changed how the checkout page is built, and custom CSS wasn't being loaded into the new structure; that's fixed for every store. If something still looks off, it may target an element id we renamed, and we're happy to check it with you.",
    },
    {
      title: "Meta Pixel purchase event sends value 0",
      description:
        "In Meta Events Manager all our Purchase events have value 0.00 (currency EUR) since the checkout update. Our ads are optimised on purchase value, so this is costing us. We use the built-in integration.",
      priority: "medium",
      labels: ["Bug"],
      note: "Pixel integration reads `order.totalPrice`, which became `order.total.amount` in the checkout-web data layer, and falls back to 0. Lena fixed the mapping (PR #5138) and checked the other pixels: TikTok had the same problem.",
      resolution:
        "After the checkout update our Meta Pixel integration read the order total from a field that had been renamed, so it sent 0. It's fixed and Purchase events carry the right value and currency again; Events Manager can take up to an hour to show it.",
    },
    {
      title: "Can we require a company name for business customers?",
      description:
        "We only sell to businesses. Is it possible to make the company name field required at checkout?",
      priority: "low",
      labels: ["Question"],
      note: "Checkout > Fields > Company: hidden, optional or required.",
      resolution:
        "Yes: under Settings > Checkout > Fields, set 'Company name' to Required. It then shows on the shipping step of every order and can't be left empty.",
    },
    {
      title: "Irish Eircodes rejected as invalid address",
      description:
        "Irish customers can't get past the address step. They type their Eircode, for example D02 X285, and get 'Please enter a valid postal code'. If they leave it empty, it says the field is required.\n\nIreland is our second market and we're getting about 15 calls a day about this.",
      priority: "high",
      labels: ["Bug", "Shipping"],
      note: "The new IE country pack only accepts the Eircode without the space (D02X285) and marks it required, though plenty of people don't know theirs. Priya fixed both (PR #5159).",
      resolution:
        "Thanks {name}. Our address rules for Ireland were updated recently and only accepted Eircodes written without a space. Both formats work now, and we made the Eircode optional again, since not every customer knows theirs.",
    },
    {
      title: "PayPal button does nothing on iPhone",
      description:
        "On iPhone, tapping the PayPal button at checkout does nothing: no popup, no error. Tested on two phones with iOS 18.5, Safari and Chrome. Desktop works.\n\nPayPal is about a third of our mobile orders and mobile is most of our traffic. It started today and we haven't touched anything.",
      priority: "urgent",
      labels: ["Bug", "Payments"],
      note: "The PayPal popup opens after an await on our `createOrder`, which now takes over a second because of the new fraud pre-check, so WebKit no longer sees a user gesture and silently blocks the popup. Lena moved the pre-check after the popup opens (PR #5140), live at 16:20.",
      resolution:
        "PayPal works on iPhone again. A check we added before opening the PayPal window made it open too late, and Safari blocks pop-ups that don't open right after a tap. We moved that check so the window opens immediately.",
    },
    {
      title: "How do we add our VAT ID to invoice PDFs?",
      description:
        "The invoice PDF attached to the confirmation email doesn't show our company VAT number, and our accountant says it must be there on EU invoices. It's filled in under Settings > Taxes but it doesn't appear on the PDF. Where do we add it?",
      priority: "medium",
      labels: ["Question", "Emails", "Taxes"],
      note: "Invoices read 'Tax ID on invoices' in Business details, not the VAT ID in the tax registrations. Two fields for the same thing; Chloé wants them merged and I agree.",
      resolution:
        "Invoices take their details from a separate field: Settings > Business details > 'Tax ID on invoices'. Enter your VAT number there and every new invoice PDF shows it. Invoices already sent can be regenerated from the order page with 'Regenerate invoice'.",
    },
    {
      title: "Click and collect for our two shops",
      description:
        "We have two physical shops and customers ask if they can order online and pick up in the shop. We'd like a 'Pick up in store' option at checkout where the customer chooses which of the two shops, free of charge.\n\nIs that possible, or planned?",
      priority: "low",
      labels: ["Feature request", "Shipping"],
      note: "Local pickup supports one location per store today, with a 'Ready for pickup' email. Multiple pickup locations are on the shipping roadmap, not scheduled. Added their vote.",
      resolution:
        "Thanks {name}. Local pickup is available today for one location (Settings > Shipping > Local pickup), including a 'Ready for pickup' email. Letting shoppers choose between several shops isn't possible yet; it's on our shipping roadmap but not scheduled, and your vote is added.",
    },
    {
      title: "Cart emptied when shopper signs in at checkout",
      description:
        "When a guest adds items to the cart and then clicks 'Sign in' on the checkout page, the cart is empty after login. They have to add everything again, and many don't.\n\n1. Open the store in a private window\n2. Add 2 or 3 products to the cart\n3. Go to checkout and click 'Already have an account? Sign in'\n4. Sign in with an existing account\n\nExpected: the guest cart is kept, or merged with the account's cart\nActual: the cart shows the account's old cart, or is empty if the account had none\n\nOur customer service had 12 complaints this week. Happens on desktop and mobile.",
      priority: "high",
      labels: ["Bug"],
      note: "Cart merge on login only runs from the storefront login page; the checkout sign-in modal calls `session.replace()` and drops the guest cart id. Repro'd on staging. Lena is wiring the modal to `cart.mergeGuest()` (PR #5171).",
      resolution:
        "Signing in from the checkout page now keeps what the shopper added as a guest and merges it with anything already saved in their account. The sign-in window on checkout was skipping the merge step that the regular login page does.",
    },
    {
      title: "Sandbox webhooks never arrive",
      description:
        "In our sandbox store, webhooks are not delivered to our test endpoint. Production webhooks work fine with the same code.\n\nWhat we did:\n1. Added our staging endpoint in the sandbox store under Developers > Webhooks\n2. Clicked 'Send test event': we receive it, 200\n3. Placed a sandbox order\n\nThe webhook log then shows:\n\n```\norder.created  queued  attempts=0\n```\n\nand it stays queued forever. Nothing reaches our server. We need this to test our integration before going live.",
      priority: "medium",
      labels: ["Bug"],
      note: "The sandbox webhook worker was scaled to zero in last week's cost clean-up; 'Send test event' uses the synchronous path, which is why that worked. Diego scaled it back with a minimum replica, and 4,300 queued sandbox events went out.",
      resolution:
        "Sandbox webhooks are flowing again. The worker that sends them was switched off by mistake during an infrastructure change last week; the test button uses a different path, which is why it still worked. Your queued events have been delivered, so expect a batch to arrive.",
    },
    {
      title: "Does the Meta Pixel slow down our checkout?",
      description:
        "Our agency says we should remove the Meta Pixel from checkout because it slows it down. But we need it for our ads. Is it really a problem?\n\nWe have Meta Pixel, GA4 and TikTok through your integrations, nothing else.",
      priority: "low",
      labels: ["Question", "Performance"],
      note: "Built-in integrations load after the page is interactive, via `requestIdleCallback`. RUM for their store: LCP p75 1.9s, no measurable difference with or without the pixels.",
      resolution:
        "Thanks {name}, with our built-in integrations it isn't a problem: they only load once checkout is ready to use, so they don't delay the page. We looked at real visits to your checkout and it loads in about 1.9 seconds for most shoppers, with no measurable difference from the pixels. Scripts added by hand in custom code are another story, so check any your agency adds.",
    },
    {
      title: "Discount applied to products we excluded",
      description:
        "Our code STAFF25 is set to exclude the 'New season' collection, but it gives 25% off those products too. The collection has 214 products and all of them get the discount.\n\nThe exclusion worked last month. We've lost around €3,100 in margin this week already.",
      priority: "high",
      labels: ["Bug", "Promotions"],
      note: "Exclusions are resolved against collection membership when the code is created. 'New season' is a smart collection (tag = 'ss26'), so products tagged later aren't excluded. Priya's PR #5150 evaluates smart collections at checkout time.",
      resolution:
        "Hi {name}, the exclusion only covered the products that were in 'New season' when the code was created, and it's a smart collection that keeps growing. We fixed it so exclusions follow the collection as it changes, and STAFF25 no longer discounts any of those 214 products.",
    },
    {
      title: "Gift cards are being taxed when sold",
      description:
        "When customers buy a gift card (€25, €50 or €100), checkout adds VAT. Our accountant says these are multi-purpose vouchers, so no VAT when sold, only when they're used. Right now we charge VAT twice.\n\nWe sell them as the product 'Digital gift card', SKU GC-DIGITAL.",
      priority: "medium",
      labels: ["Bug", "Taxes", "Promotions"],
      note: "They set it up as a normal product instead of the Gift card product type, so it picks up the standard tax category. Gift card type is excluded from tax automatically. 31 orders charged VAT so far; list attached for them.",
      resolution:
        "Hi {name}, your gift card was set up as a regular product, so it got the standard VAT rate. Change its product type to 'Gift card' (Products > GC-DIGITAL > Product type) and it's sold without VAT and taxed when redeemed, as your accountant expects. So far 31 gift card orders were charged VAT; the list is attached in case you need to correct them.",
    },
    {
      title: "Show why an order was flagged as high risk",
      description:
        "When an order is flagged 'High risk' we only see the score (for example 87) with no explanation. To decide whether to cancel or ship, we'd like to know the reasons, like 'IP country differs from billing' or 'many attempts with different cards'.\n\nOther platforms show this. Now we email the customer to ask questions, and it's awkward.",
      priority: "low",
      labels: ["Feature request", "Payments"],
      note: "Risk service already returns the top contributing signals (`reasons[]`), admin just shows the score. Diego says the reasons are stable enough to show; on the admin backlog.",
      resolution:
        "Hi {name}, good request. Our fraud check already gives us those reasons, we just don't show them yet. It's on our backlog and fairly small, but there's no date; until then, reply here with any order number and we'll tell you why it was flagged.",
    },
    {
      title: "Free shipping removed when a gift card is used",
      description:
        "We offer free shipping over €75. If a customer has €90 in the cart and pays part with a gift card, the free shipping disappears and €6.95 shipping is added. The gift card is a way to pay, it shouldn't change the order value.\n\nCustomers are complaining and it looks like we're tricking them. It happens every time.",
      priority: "high",
      labels: ["Bug", "Shipping", "Promotions"],
      note: "The promotions engine applies gift cards as a negative line item, so the free shipping threshold sees the post-gift-card subtotal. Priya moved gift card application after shipping evaluation (PR #5166); tax was already handled correctly.",
      resolution:
        "Thanks {name}, you're right that a gift card is a payment, not a discount. Our checkout subtracted it before checking the free shipping threshold. That's fixed, so a €90 order keeps free shipping however much of it is paid by gift card.",
    },
    {
      title: "Order confirmation emails stopped completely",
      description:
        "No order confirmation emails have gone out since about 8 this morning. 120 orders, zero emails. Customers are writing to ask if their order went through.",
      priority: "urgent",
      labels: ["Bug", "Emails"],
      note: "Our email provider suspended the shared sending pool overnight after a bounce-rate alert, so every merchant on that pool is affected. Priya switched to the backup pool at 09:40 and re-queued 18k messages; Maya posted on the status page.",
      resolution:
        "Emails are going out again. Our email provider paused one of our sending pools this morning, which stopped confirmation emails for every merchant on it. We moved to our backup and re-sent everything from this morning, so your 120 customers should have their emails by now.",
    },
    {
      title: "Apartment field suddenly mandatory",
      description:
        "Since today the 'Apartment, suite, etc.' field is required at checkout. Most of our customers live in houses and they write 'none' or '-'. Can you make it optional again?",
      priority: "medium",
      labels: ["Bug", "Shipping"],
      note: "Not a platform change: the activity log shows one of their staff set Address line 2 to 'Required' yesterday afternoon.",
      resolution:
        "This came from a setting on your side: someone on your team set 'Address line 2' to Required yesterday afternoon (you can see it in Settings > Activity log). Switch it back to Optional under Settings > Checkout > Fields.",
    },
    {
      title: "Webhook for abandoned carts",
      description:
        "Our developer built a custom reminder flow and we'd need a webhook when a checkout is abandoned (email entered but no order after X minutes). Now we poll your API every 10 minutes, which is clumsy.\n\nIs that possible?",
      priority: "low",
      labels: ["Feature request"],
      note: "`checkout.abandoned` exists internally for our own abandoned cart emails and the Klaviyo integration, but isn't a public webhook. Logged on the API backlog.",
      resolution:
        "Hi {name}, there's no webhook for abandoned checkouts yet, though we use that event internally for our own reminder emails. I've added your request to the API backlog. If Klaviyo is an option for you, our Klaviyo integration already sends 'Started checkout' events, which its abandoned cart flows use.",
    },
    {
      title: "Webhook signatures invalid since we rotated the secret",
      description:
        "We rotated our webhook signing secret on Monday (Developers > Webhooks > Rotate). Since then about half of the webhooks fail our signature check, the other half are fine.\n\nOur verification (Node):\n\n```js\nconst expected = crypto.createHmac('sha256', process.env.BC_WEBHOOK_SECRET).update(rawBody).digest('hex');\nif (expected !== req.headers['x-brightcart-signature']) return res.status(401).end();\n```\n\nOnly the new secret is deployed. Failed deliveries show `401` in the webhook log, for example event `evt_8841203` (order.created). This worked for two years with the old secret, so I don't think it's our code.",
      priority: "high",
      labels: ["Bug"],
      note: "Rotation only updated the signing key in the primary region; the us-east delivery workers cache signing keys with no TTL and kept signing with the old one, which is exactly the 50%. Diego flushed the cache and is making rotation broadcast an invalidation (PR #5102).",
      resolution:
        "Thanks {name}, it wasn't your code. After you rotated the secret, one of our two regions kept signing with the old one because of a cache that never refreshed. We cleared it, every webhook is signed with the new secret now, and we re-sent the deliveries that failed since Monday.",
    },
    {
      title: "GBP exchange rate not updated since Friday",
      description:
        "Our prices for UK shoppers are converted from EUR automatically. Settings > Currencies > GBP says 'Last updated 5 days ago' and the rate hasn't moved since. The pound moved quite a bit this week, so our UK prices are off.",
      priority: "medium",
      labels: ["Bug", "Payments"],
      note: "Rates provider changed the response shape for GBP only (new `pair` wrapper); our parser threw on it and kept the last value. Diego fixed the parser and added an alert for any rate older than 24h.",
      resolution:
        "Our exchange rate provider changed the format of its GBP data and our import stopped updating that one rate. GBP updates daily again and today's rate is already applied, and we added an alert so a stale rate is caught within a day.",
    },
    {
      title: "Age check for restricted products",
      description:
        "Some of our products (certain supplements and some OTC medicines) may only be sold to adults. We'd like checkout to ask for a date of birth or do an age verification, only for these products.\n\nAt the moment we check manually after the order and cancel if needed, which isn't nice for the customer.",
      priority: "medium",
      labels: ["Feature request"],
      note: "No age verification at checkout. Closest thing is a required checkbox custom field shown by product tag. Two other health merchants have asked; Maya is collecting these for product planning.",
      resolution:
        "Hi {name}, we don't have age verification at checkout yet. I've logged your request with the others we've had from health and pharmacy stores for our next planning round. Meanwhile, a required checkbox ('I confirm I am 18 or older') can be shown only when the cart contains products with a given tag, under Settings > Checkout > Custom fields.",
    },
    {
      title: "Saved cards not shown to returning customers",
      description:
        "Returning customers who saved their card don't see it at checkout anymore and have to type it again. All browsers.\n\n1. Log in as a customer with a saved card (in admin I see it on the customer: Visa ending 4412)\n2. Add a product and go to checkout\n3. The payment step shows only the empty card form\n\nExpected: 'Visa ending 4412' as an option\nActual: no saved cards section at all\n\nIn the network tab, `GET /checkout/payment-methods` returns `saved: []`. It started after we switched the store to the new checkout last Wednesday.",
      priority: "medium",
      labels: ["Bug", "Payments"],
      note: "New checkout looks saved cards up by Brightcart customer id; cards saved before the switch are keyed on the old storefront customer token. `backfill_payment_method_owner` skipped stores that opted into the new checkout manually. Ran it for this store: 3,812 cards re-linked.",
      resolution:
        "Thanks {name}, saved cards are showing again. Cards saved before you moved to the new checkout were stored under an old customer reference, and the migration that moves them hadn't run for your store. We ran it, and all 3,812 saved cards are linked to their customers again.",
    },
    {
      title: "Shipping by weight ignores variant weight",
      description:
        "Our shipping rates are by weight (0-2 kg €4.95, 2-10 kg €8.95, 10+ kg €19.95). Our planters come in 3 sizes with different weights, but checkout always uses the weight of the product, not of the variant.\n\nExample:\n- Product 'Terracotta planter', weight 1.2 kg\n- Variant 'Large' (SKU TP-L), weight 11.5 kg\n- Cart with 1x Large: checkout charges €4.95\n\nExpected €19.95. We lose money on every large planter. The variant weights are filled in, we imported them with the column `variant_weight_kg`.",
      priority: "medium",
      labels: ["Bug", "Shipping"],
      note: "The CSV import writes `variant_weight_kg` but leaves `weight_unit` null, and rate calculation skips unit-less variant weights and falls back to the product. Priya fixed the importer default and backfilled units for this store (2,140 variants).",
      resolution:
        "Thanks {name}. The weights were imported without a unit, and checkout ignores variant weights that have no unit and uses the product weight instead. We set the unit to kg on all your variants and fixed the import to set it automatically; the large planter now gets the €19.95 rate.",
    },
    {
      title: "Screen reader doesn't announce card errors",
      description:
        "A blind customer contacted us: when her card number is wrong, VoiceOver says nothing. She only found out because the Pay button did nothing.\n\nWe want our checkout to be accessible, and in the EU there are legal requirements for us from this year (the European Accessibility Act).",
      priority: "medium",
      labels: ["Bug"],
      note: "Card field errors render inside the payment iframe with no `aria-live` region and nothing linked via `aria-describedby`. Lena added a live region outside the iframe that mirrors the error text (PR #5147); tested with VoiceOver and NVDA.",
      resolution:
        "Thank you for passing this on. Card errors are now announced by screen readers; we tested with VoiceOver on iPhone and Mac and with NVDA on Windows. We're also running a full accessibility review of checkout for the European Accessibility Act and will share the report when it's done.",
    },
    {
      title: "Allow paying with two cards",
      description:
        "Customers buying our bigger furniture (sofas from €2,400) sometimes want to split the payment over two cards because of card limits. Right now they call us and we create two orders by hand.\n\nIt would be great if checkout supported split payments.",
      priority: "medium",
      labels: ["Feature request", "Payments"],
      note: "Multiple cards on one order isn't supported, only gift card plus one other method. 'Multi-tender' is on the payments roadmap for next year. Added this merchant to the request.",
      resolution:
        "Thanks for the detailed use case. Paying with two cards isn't possible yet; it's on our payments roadmap but not planned for this year, and your vote is added. Until then, offering Klarna or PayPal Pay Later on larger orders helps many furniture stores with card limits.",
    },
    {
      title: "Order confirmations going to Gmail spam",
      description:
        "Several customers told us our order confirmation ended up in spam, all of them with Gmail addresses. We send from our own address since we set up a custom sender domain last month. Outlook customers get them fine.\n\nIs something wrong in the setup?",
      priority: "medium",
      labels: ["Question", "Emails"],
      note: "Sender domain passes SPF but the two DKIM CNAMEs were never added, so Gmail sees `dkim=none` and their DMARC policy is `quarantine`. Sent them the records.",
      resolution:
        "Hi {name}, your sender domain is only half set up: SPF is fine, but the two DKIM records were never added, and your DMARC policy tells Gmail to put unsigned mail in spam. Add the two CNAME records shown under Settings > Emails > Sender domain; once they verify, usually within an hour, confirmations should land in the inbox.",
    },
    {
      title: "Let shoppers choose a delivery date",
      description:
        "We sell fresh flowers and plants, and customers want to choose the delivery day (birthdays, events). Now we use the order note field and customers write the date in all kinds of formats.\n\nA date picker with blocked days (Sunday and Monday for us) would really help.",
      priority: "medium",
      labels: ["Feature request", "Shipping"],
      note: "No real delivery date picker. Custom fields support a 'Date' type with a minimum lead time and blocked weekdays, which covers most of it. 'Scheduled delivery' with daily capacity is on the shipping roadmap.",
      resolution:
        "Thanks {name}, a proper delivery date picker is on our shipping roadmap and your vote is added. In the meantime you can add a custom checkout field of type 'Date' (Settings > Checkout > Custom fields) with at least 2 days' notice and Sundays and Mondays blocked, which gives you a consistent date on every order and in exports.",
    },
    {
      title: "Is our order button compliant in Germany?",
      description:
        "Our lawyer says that in Germany the final button must say 'zahlungspflichtig bestellen' or similar, otherwise the contract may not be valid (the Button-Lösung). Our checkout button says 'Jetzt bezahlen'.\n\nCan we change the text? And is your default German text compliant?",
      priority: "medium",
      labels: ["Question"],
      note: "The old checkout used 'Zahlungspflichtig bestellen'; the translation vendor changed the de-DE default to 'Jetzt bezahlen' in 4.12. Lena reverted the default, and the label can be overridden per store.",
      resolution:
        "Thanks {name}, your lawyer is right, and our German default had drifted to 'Jetzt bezahlen' in a recent translation update. We changed it back to 'Zahlungspflichtig bestellen' for every German checkout. If you prefer other compliant wording, you can override it under Settings > Checkout > Language > Button labels.",
    },
  ],
  threads: [
    {
      title: "Customers charged twice when 3-D Secure times out and they retry",
      description:
        "We have a serious problem since the start of the week: customers are being charged twice for one order. Our CS team has 17 complaints so far and it's growing.\n\nThe pattern, from what customers tell us:\n1. They pay by card and get the 3-D Secure challenge in their bank app\n2. The bank app is slow and checkout shows 'Verification timed out' with a 'Try again' button\n3. They click Try again, approve in the bank app and get the confirmation page\n4. The next day they see two charges on their card\n\nExamples: orders 418207 (€189.90), 418233 (€74.95), 418310 (€249.00). In Adyen each of these has two authorisations, both captured, but there is only one order in Brightcart.\n\nThis is our autumn campaign week and people are posting about it on social media. Please escalate.\n\nDaniel\nOps lead, Atlas Sports Group",
      priority: "urgent",
      labels: ["Bug", "Payments"],
      status: "in_progress",
      assigneeId: "diego-alvarez",
      organizationId: "atlas-sports-group",
      quietForHours: 1.5,
      messages: [
        {
          kind: "public_reply",
          authorId: "diego-alvarez",
          afterMinutes: 12,
          body: "Hi {name}, Diego here from payments engineering. I'm on this now and treating it as urgent. I can see the two authorisations on 418207 and 418233 in Adyen.\n\nI'll post what we find here within the hour. If you get more examples, please send the order numbers, especially any placed before this Monday.",
          statusChange: "in_progress",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 26,
          body: "All three examples have the same shape:\n\n1. First authorisation starts the 3DS challenge\n2. Client hits the 90s `3ds_timeout`, shopper clicks 'Try again'\n3. Second authorisation goes out with a **different** idempotency key (`chk_8f2a…:1`, then `chk_8f2a…:2`), so Adyen treats it as a new payment\n4. Shopper finishes the first challenge in the bank app a bit later, so both authorise and both auto-capture\n\nNothing ever cancels the first attempt.",
        },
        {
          kind: "customer_message",
          afterMinutes: 18,
          body: "More from our CS team this morning: 418355, 418362, 418398, 418411, 418460.\n\nOne customer (418398) was charged three times, she clicked Try again twice. We are refunding manually in Adyen but it's taking our finance team hours.",
        },
        {
          kind: "internal_note",
          authorId: "maya-chen",
          afterMinutes: 9,
          body: "Ravi called: Atlas's CEO is asking about this and Ravi wants an update from us twice a day until it's fixed. I'll handle the customer updates so Diego can stay on the fix.\n\nDatadog: 212 checkout sessions with 2+ captured authorisations in the last 4 days across all merchants, 131 of them Atlas. Atlas forces a 3DS challenge on every order over €150, which is why they're hit hardest.",
        },
        {
          kind: "public_reply",
          authorId: "maya-chen",
          afterMinutes: 14,
          body: "Hi {name}, Maya here, I lead support for Checkout. Diego has found the pattern: when 3-D Secure times out and the shopper retries, the retry is sent as a new payment instead of continuing the first one. If the shopper also finishes the first check in their bank app, both payments go through.\n\nWhat happens next:\n- Diego is working on the fix now\n- Your finance team can stop refunding by hand: we'll refund duplicate charges from our side and send you the list\n- I'll update you here every morning and afternoon until this is closed\n\nThanks for the extra order numbers. They all match the pattern, including the triple charge on 418398.",
        },
        {
          kind: "internal_note",
          authorId: "lena-fischer",
          afterMinutes: 48,
          body: "Found where it comes from. The 'Try again' button on the 3DS timeout screen shipped in checkout-web 4.18.0 last week, and it calls `startPayment()`, which builds a new attempt with a new idempotency key. Before 4.18 the shopper had to reload, and reload goes through `resumePayment()`, which reuses the session's pending attempt. So it's a regression from my change. I can hide the button behind a flag in a few minutes.",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 22,
          body: "Plan:\n\n1. Lena turns off `checkout_3ds_retry_button` for all stores. The timeout screen goes back to 'Check your banking app, then reload this page'.\n2. I run a job every 30 min: sessions with 2+ successful authorisations for the same amount within 20 min, keep the one linked to the order, refund the rest.\n3. Real fix: a retry must reuse the attempt's idempotency key, and if Adyen still has the first authorisation pending, poll it instead of creating a new one. Starting on that now.",
        },
        {
          kind: "public_reply",
          authorId: "diego-alvarez",
          afterMinutes: 35,
          body: "Hi {name}, update from me:\n\n- The 'Try again' button on the timeout screen is switched off for now. Shoppers see 'Check your banking app, then reload this page', and reloading continues the same payment, so there's no new charge.\n- A job now runs every 30 minutes and refunds second charges from the same checkout. The first run refunded 64 charges on your account; the CSV (order number, PSP reference, amount, refund reference) is attached.\n- The proper fix is in progress.\n\nIf you see a new duplicate on an order placed from now on, please send it straight away, because that would mean we've missed something.",
        },
        {
          kind: "customer_message",
          afterMinutes: 170,
          body: "Thanks, the refunds are showing in Adyen and our CS team is using your CSV to answer customers.\n\nOne problem: refunds take 3-5 days to show on the customer's card, so they still see two charges and keep calling us. Can you cancel the second payment instead of refunding it? When we cancel an authorisation ourselves, it disappears from the banking app in a day or so.",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 25,
          body: "He's right that a cancel is nicer, but Atlas captures immediately (`captureDelay: immediate` on `AtlasSportsGroupECOM`), so by the time the job runs there's nothing left to cancel. If they accept a 2h capture delay, the job can cancel duplicates before capture. Their warehouse picks in the afternoon, so it might be fine. Asking them.",
        },
        {
          kind: "public_reply",
          authorId: "diego-alvarez",
          afterMinutes: 12,
          body: "{name}, we can only cancel a payment before it's captured, and your account captures immediately. If you're OK with delaying capture by 2 hours, our job will cancel duplicates before they're captured, and shoppers see the extra hold disappear instead of waiting for a refund.\n\nThe only change for you: payments show as 'Authorised' in Adyen for up to 2 hours before they become 'Captured'. Can you confirm that works for you?",
          statusChange: "blocked",
        },
        {
          kind: "customer_message",
          afterMinutes: 45,
          body: "Yes, please do it. 2 hours is no problem, our warehouse doesn't pick before 14:00 anyway.",
          statusChange: "in_progress",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 20,
          body: "Capture delay set to 120 min on `AtlasSportsGroupECOM`. The job now cancels uncaptured duplicates and only refunds when a duplicate is already captured. Evening run: 9 duplicates, all cancelled, 0 refunds.",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 720,
          body: "PR #5214 merged: a retry after `3ds_timeout` reuses the attempt's idempotency key, and if Adyen reports the first authorisation as pending we poll `/payments/details` for up to 60s before offering anything new. Priya ran it against the Adyen test ACS with a delayed challenge: one authorisation every time.\n\nRolling out to 10% of checkout traffic at 08:00, then 100% at 09:30 if the duplicate rate on the dashboard stays at zero.",
        },
        {
          kind: "public_reply",
          authorId: "maya-chen",
          afterMinutes: 150,
          body: "Good morning {name}, as promised:\n\n- The fix for retries after a 3-D Secure timeout is live for all stores since 09:30. A retry now continues the same payment instead of starting a new one.\n- Overnight our job cancelled 11 duplicates on your account before capture, so none of those shoppers were charged twice.\n- We're keeping the job and the 2-hour capture delay until we've seen a few clean days. The 'Try again' button stays off until then, and we'll tell you before we turn it back on.\n\nThe updated CSV is attached.",
        },
        {
          kind: "customer_message",
          afterMinutes: 360,
          body: "Big improvement, our CS team had 3 complaints today against 40 on Monday.\n\nBut we have one new case that looks different: order 419882. The customer's 3-D Secure timed out, she then paid with Apple Pay instead of the card, and she was charged on both: €139.95 on the card and €139.95 on Apple Pay. So is there another way to be charged twice?",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 32,
          body: "419882 is a different path. The card attempt sat pending at the issuer's ACS for ~5 min and was then authorised; meanwhile she switched to Apple Pay, which is a different payment method, so the new code correctly started a new attempt. Nothing cancelled the pending card attempt.\n\nThe job missed it too, because it only matches duplicates within the same payment method, and the card auth was captured when the 2h delay ran out. Fixing the job first, then the real fix: switching method has to cancel the pending attempt at Adyen before starting another.",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 40,
          body: "Job now matches duplicates by session and amount across payment methods. Re-ran it over the last 3 days: 419882 plus 4 method-switch cases on other merchants, all refunded since they were already captured. Card charge on 419882 refunded, reference in the CSV.",
        },
        {
          kind: "internal_note",
          authorId: "maya-chen",
          afterMinutes: 15,
          body: "Ravi asked for an ETA on the method-switch case for his call with Atlas on Thursday. Told him: the job covers it from now on, code fix in review by tomorrow, deploy after Priya's tests. Diego, shout if that's too tight.",
        },
        {
          kind: "public_reply",
          authorId: "diego-alvarez",
          afterMinutes: 18,
          body: "Thanks for 419882, {name}, good catch. It's a second path: the card payment was still waiting on the bank when she switched to Apple Pay, and switching methods didn't cancel it. We refunded the card charge (reference in the updated CSV).\n\nFrom now on our job also catches duplicates across payment methods, so this case is covered while we fix it properly: when a shopper switches method, checkout will cancel the waiting payment first. I'll update you tomorrow morning.",
        },
        {
          kind: "customer_message",
          afterMinutes: 610,
          body: "OK, thanks Diego. Please also tell me before you turn the Try again button back on, our CS scripts mention it.\n\nDaniel",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 70,
          body: "Draft PR #5239: on payment method switch, send `/cancels` for any pending attempt in the session and wait for the result before creating the new payment. If the cancel fails because the auth already went through, show 'Your payment went through' instead of the new method.\n\nPriya is writing test cases with a delayed ACS. Atlas capture delay and the duplicate job stay on until this ships.",
        },
      ],
    },
    {
      title: "Reverse charge not applied for EU business customers with VAT ID",
      description:
        "Hello,\n\nWe are a pharmacy wholesaler based in Lyon and we sell to clinics and pharmacies in other EU countries. When a business customer enters a valid VAT number at checkout, the order should be invoiced without French VAT (reverse charge, intra-community supply). This works for some orders but not for others: many B2B orders to Belgium and Germany are charged 20% French VAT although the customer gave their VAT number.\n\nOur accountant found 38 invoices like this last month while preparing the VAT return. We have to correct them, and we want to understand why it happens before the next return.\n\nExamples: 77412 (Belgium), 77460 (Belgium), 77533 (Germany). Order 77490 (Netherlands) was correct.\n\nBest regards,\nClaire\nFinance, Meridian Pharmacy",
      priority: "high",
      labels: ["Question", "Taxes"],
      status: "blocked",
      assigneeId: "maya-chen",
      organizationId: "meridian-pharmacy",
      quietForHours: 30,
      messages: [
        {
          kind: "public_reply",
          afterMinutes: 50,
          body: "Hi {name}, thank you for the examples, they help a lot. I'm looking into it now. Two questions while I check the orders:\n\n1. Do your customers type the VAT number in the 'VAT number' field on the checkout page, or is it saved on their customer account?\n2. Is everything on this one store, or do you also have a separate storefront (for example for Belgium)?\n\nI'll come back to you today with what I find on the four orders.",
          statusChange: "in_progress",
        },
        {
          kind: "customer_message",
          afterMinutes: 190,
          body: "Hello Maya,\n\n1. Both. New customers type it at checkout. Our regular customers have it saved in their account, since we asked all of them to add it last year.\n2. Only this store.\n\nI checked 77412 again: the customer is a pharmacy in Liège, their number is BE0412345678 and it is valid on the VIES website today.\n\nClaire",
        },
        {
          kind: "internal_note",
          afterMinutes: 30,
          body: "Tax logs for the four orders:\n\n- 77490 (NL): `vat_id_status: valid`, reverse charge applied\n- 77412, 77460 (BE): `vat_id_status: unverified`, reason `vies_timeout`, so FR VAT charged\n- 77533 (DE): `vat_id_status: invalid`\n\nChloé, you handled the VIES tickets in the spring. What do we do on a timeout?",
        },
        {
          kind: "internal_note",
          authorId: "chloe-martin",
          afterMinutes: 25,
          body: "VIES is slow or down for single member states a lot, Belgium and Germany are the worst. If it doesn't answer in 5s we mark the ID `unverified` and follow the store setting `vat_validation.on_unavailable`: `charge_vat` (the default) or `accept_and_revalidate` (reverse charge now, re-check within 24h, flag the order if it comes back invalid). Meridian is on the default. Most B2B merchants switch after their first bad month.",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 45,
          body: "77533 is on us. The customer typed `DE DE 811234567` (prefix twice, that's how it's printed on some German letterheads). Our normalizer strips spaces and dots but not a doubled country prefix, so VIES gets `DEDE811234567` and says invalid. Small fix, PR #5198. Same check on Meridian's last 90 days of orders: 6 more with a doubled prefix.",
        },
        {
          kind: "public_reply",
          afterMinutes: 35,
          body: "Hi {name}, here is what we've found so far. There are two different causes.\n\n**1. The EU validation service (VIES) didn't answer.** We check every VAT number with VIES at checkout. For 77412 and 77460 the Belgian VIES service didn't respond in time, which happens several times a week for some countries. Your store is set to charge VAT when a number can't be checked, so those orders got 20%.\n\nThis can be changed. With 'Accept and re-check', we apply reverse charge straight away and check the number again within 24 hours; if it turns out invalid, the order is flagged for you to correct. Because your company carries the risk if a number is invalid, I'd like your or your tax advisor's decision before we change it.\n\n**2. A formatting bug on our side.** For 77533 the customer typed the German prefix twice ('DE DE…'). We should have cleaned that up and didn't. Diego is fixing it now, and we found 6 more orders with the same problem in the last 90 days.\n\nThe order numbers for both causes are in the attached CSV.",
        },
        {
          kind: "customer_message",
          afterMinutes: 1320,
          body: "Thank you Maya, it is very clear.\n\nI discussed with our tax advisor and we want 'Accept and re-check'.\n\nBut there is a third case which is not in your list. Some customers have their VAT number saved in their account, they didn't type it again at checkout, and the order has no VAT number at all. For example 77588 and 77602, both Germany. These are regular customers and I can see the number in their account in the admin.\n\nClaire",
        },
        {
          kind: "internal_note",
          afterMinutes: 35,
          body: "77588 and 77602: order has `tax_id: null`, customer profile has the VAT ID. Both checked out with a saved address created in 2024, before they added the VAT ID. Looks like the ID lives on the address, not the customer. Chloé, can you confirm?",
        },
        {
          kind: "internal_note",
          authorId: "chloe-martin",
          afterMinutes: 55,
          body: "Confirmed on a test store. Meridian is still on the legacy `tax_id_source: address`: the VAT ID is stored per address and only copied onto addresses created after it was saved. Stores created since last year use `tax_id_source: customer`, where checkout reads it from the profile, and switching fixes every saved address. We had the same thing with a bike shop in the spring.\n\nHeads-up: the switch changes which column their order export fills, so they should check their ERP import before we flip it.",
        },
        {
          kind: "internal_note",
          authorId: "diego-alvarez",
          afterMinutes: 140,
          body: "PR #5198 deployed, doubled prefixes are cleaned before the VIES call. Re-validated every Meridian order with a VAT ID from the last 90 days: 224 orders, 61 charged VAT. Of those 61: 47 validate fine now (VIES timeouts and doubled prefixes), 9 have no VAT ID on the order (the address case), 5 are really invalid.",
        },
        {
          kind: "public_reply",
          afterMinutes: 25,
          body: "Hi {name}, good news on two points, and one more finding.\n\n- The formatting bug is fixed, so 'DE DE…' numbers validate now.\n- 77588 and 77602: your store uses an older setting where the VAT number is saved on each address rather than on the customer. Addresses created before a customer added their number don't have it, so checkout didn't see it. Newer stores read it from the customer account, and we can switch you over.\n\nOver the last 90 days we see 61 orders charged VAT although the customer had given a number: 47 have valid numbers (VIES timeout or formatting), 9 are the address case, and 5 numbers are really invalid.\n\nOne thing to check before we change both settings: after the switch, the VAT number in your order export comes from the customer account instead of the address. If your ERP import reads the `billing_vat_id` column it keeps working; if it reads `shipping_address_vat_id`, that column will be empty.",
        },
        {
          kind: "customer_message",
          afterMinutes: 280,
          body: "Our ERP uses `billing_vat_id`, so it should be fine, but our IT will confirm.\n\nFor the corrections, our accountant needs the full list with the invoice numbers, not only the order numbers, and it must match our own list from the ERP. Also our year-end audit starts soon, so we need this finished quickly please.\n\nClaire",
        },
        {
          kind: "internal_note",
          afterMinutes: 20,
          body: "Ravi says Meridian's auditors start in about three weeks and the CFO is nervous. Invoice numbers only exist in their ERP, so I need their export to build a matching list. I'm also not flipping `on_unavailable` or `tax_id_source` without written confirmation from an account owner: it's a tax setting on an Enterprise account, and their IT hasn't confirmed the export column yet.",
        },
        {
          kind: "public_reply",
          afterMinutes: 25,
          body: "Hi {name}, understood, we're giving this priority. To send you one list that matches your ERP and to change the settings, I need three things from you:\n\n1. **An export of the affected orders**: Orders > Export with the 'Tax details' preset, filtered on orders with a VAT number since the start of the year, with the invoice number from your ERP added as a column. We'll match it against our 61 orders (and extend our check to the same period) and send back one list with the correct VAT treatment for each invoice.\n2. **Your VAT ID validation settings, confirmed in writing**: a screenshot of Settings > Taxes > VAT numbers as you see it today, and a reply here from an account owner confirming you want 'Accept and re-check' and the VAT number read from the customer account.\n3. **Your IT's confirmation** that the ERP import reads `billing_vat_id`.\n\nAs soon as we have these, we'll switch both settings the same day and send you the reconciled list.",
          statusChange: "blocked",
        },
      ],
    },
  ],
};
