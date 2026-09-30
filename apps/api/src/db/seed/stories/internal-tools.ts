import type { ProjectStories } from "../story.ts";

export const internalToolsStories: ProjectStories = {
  stories: [
    {
      title: "Customer export shows garbled accented names in Excel",
      description:
        "When we export customers (Customers > Export > All customers, CSV) and open the file in Excel, every name with an accent is broken. `Müller` becomes `MÃ¼ller`, `François` becomes `FranÃ§ois`.\n\nIn Google Sheets the same file looks fine. About 3,000 of our customers are in Germany and France, so this is most of the list, and our marketing agency only works in Excel.",
      priority: "medium",
      labels: ["Bug", "Exports"],
      note: "The CSV is UTF-8 without a BOM, so Excel on Windows falls back to Windows-1252. Tomás says the old exporter wrote a BOM and the new streaming writer dropped it in PR #3920.",
      resolution:
        "Hi {name}, customer and order exports start with a UTF-8 marker again, so Excel reads accented names correctly. Please run the export once more: files exported before today will still look wrong in Excel, but they open fine in Google Sheets or through Data > From Text/CSV.",
    },
    {
      title: "Order export times are in UTC, not store time",
      description:
        "The `created_at` column in the order export is two hours behind what the admin shows (our store is on Europe/Madrid). Orders placed after 22:00 land on the wrong day and our daily reconciliation never matches.",
      priority: "medium",
      labels: ["Bug", "Exports"],
      note: "Exporter formats dates with `toISOString()`, so everything comes out in UTC with a Z, while the admin list uses the store time zone. Priya found a two-year-old ticket asking for the same thing.",
      resolution:
        "Thanks {name}, you were right that this was inconsistent. Order exports now use your store's time zone and include the offset (for example `23:41:00+02:00`), so late orders land on the right day. Re-exporting past dates gives you the corrected times.",
    },
    {
      title: "Barcode column missing from product export",
      description:
        "Our product export used to have a `Variant Barcode` column. Since last week it's gone, and our POS import depends on it.",
      priority: "medium",
      labels: ["Bug", "Exports"],
      note: "Barcode now only appears when 'Include inventory fields' is ticked; the export dialog redesign moved it into that group. Hana confirmed on a test store.",
      resolution:
        "The barcode column moved: in the export dialog, tick Include inventory fields and `Variant Barcode` is back in the same position as before. From next week's release it's part of the default columns again, since several POS setups rely on it.",
    },
    {
      title: "How do I export only orders tagged wholesale?",
      description:
        "We tag B2B orders with `wholesale`. Is there a way to export just those for our accountant instead of the whole month?",
      priority: "low",
      labels: ["Question", "Exports"],
      note: "Tag filter works in the orders list and the export respects it, but only when you pick 'Current view' in the dialog. Easy to miss.",
      resolution:
        "In Orders, filter by Tag = wholesale and the date range you need, then click Export and choose Current view instead of All orders. The CSV will contain only the filtered orders.",
    },
    {
      title: "Order export doubles our revenue in the pivot table",
      description:
        "Our finance team built a pivot table from the order export and last month's revenue comes out at £184,300, while the Brightcart dashboard says £96,120.\n\nLooking at the file, some orders appear two, three, even six times. Order 482910 has four rows and the `total` column says £212.40 on all four. Is the export duplicating orders?",
      priority: "medium",
      labels: ["Question", "Exports"],
      note: "Not a bug: they used the Line items template, which repeats order-level columns on every line. Summing `total` over line rows multiplies it by the number of products.",
      resolution:
        "Hi {name}, the export isn't duplicating orders. The Line items template has one row per product, and order-level columns like `total` are repeated on each of those rows. For revenue, use the Orders summary template (one row per order), or sum `line_total` instead of `total` in your pivot.",
    },
    {
      title: "Please add scheduled exports to our SFTP server",
      description:
        "Every morning someone on our team logs in, exports yesterday's orders and uploads the CSV to our 3PL's SFTP. It only takes ten minutes, but when that person is on holiday it gets forgotten and the 3PL calls us.\n\nCould Brightcart run the export on a schedule and push it to an SFTP server, or at least email it? We would happily pay extra for this.",
      priority: "low",
      labels: ["Feature request", "Exports", "Integrations"],
      note: "Fourth request for scheduled exports this quarter. Linked it to the scheduled exports item on the back-office roadmap; Maya is collecting use cases.",
      resolution:
        "Thanks {name}, I've added your use case to the scheduled exports request. It isn't planned for this quarter. Until then, a Zapier zap with the New Order trigger and an SFTP action can send each order to your 3PL automatically.",
    },
    {
      title: "Discount column empty for automatic discounts",
      description:
        "In the order export, `discount_code` and `discount_amount` are filled when a customer types a code, but empty for our automatic 'Buy 2, get 10% off' promotion. The order totals are correct, so the money is fine, but we can't report what the promotion cost us.\n\nExamples: 553201, 553388, 553402.",
      priority: "medium",
      labels: ["Bug", "Exports"],
      note: "Automatic discounts are stored as `discount_applications` with type `automatic` and the exporter only reads `discount_codes`. Tomás has a fix that maps the promotion title to `discount_code` and sums the amounts.",
      resolution:
        "Fixed: automatic discounts now appear in the order export, with the promotion's title in `discount_code` and the amount in `discount_amount`. Re-running the export for past dates includes them too.",
    },
    {
      title: "Inventory export only includes our first warehouse",
      description:
        "We have 3 locations (Leeds, Bristol and the shop). Inventory export has only one `on_hand` column and the numbers match Leeds only, Bristol stock is nowhere in the file. We do a stock count tomorrow morning and need per location numbers tonight please.",
      priority: "high",
      labels: ["Bug", "Exports"],
      note: "Inventory export predates multi-location and reads `default_location_id` only. Workaround: the Inventory by location report in Analytics exports all locations. Real fix is in Tomás's queue.",
      resolution:
        "For tonight, go to Analytics > Reports > Inventory by location and click Export: it has one row per SKU and location, including Bristol and the shop. The standard inventory export will get per-location columns in an upcoming release.",
    },
    {
      title: "Unsubscribed customers exported as subscribed",
      description:
        "We export customers every week and upload them to our email provider. A customer complained that she got our newsletter after unsubscribing twice. We checked:\n\n1. In the admin her profile shows Email marketing: Unsubscribed.\n2. In this morning's customer export her row has `accepts_marketing` = `true`.\n3. We checked 20 other customers who unsubscribed in the last month: 14 of them are `true` in the export.\n\nExpected: `accepts_marketing` matches what the admin shows.\n\nThis is a GDPR problem for us and we've stopped all campaigns until it's fixed. Customer IDs: 1184402, 1190377, 1201846.",
      priority: "high",
      labels: ["Bug", "Exports"],
      note: "Unsubscribes from the email footer link update `marketing_consent` but not the legacy `accepts_marketing` column, and the export still reads the legacy one. Priya's Metabase query shows about 2,300 affected customers across all stores.",
      resolution:
        "Hi {name}, thanks for the careful report. The export was reading an old field that unsubscribe links didn't update; it now uses the same consent status the admin shows, and we've corrected the old field for every affected customer. Your next export will be accurate, so it's safe to resume campaigns once you've re-synced your list.",
    },
    {
      title: "VAT report and order export totals don't match",
      description:
        "Our accountant has to file the VAT return by Friday and the numbers don't agree:\n\n- VAT report (Analytics > Taxes), last quarter: €41,882.16 tax\n- Sum of `tax_total` in the order export, same date range: €42,517.90\n\nThe difference is €635.74. Both are filtered on paid orders, same store, same dates. Which one is correct for the tax return? There are about 7,800 orders in the quarter, so we can't check them one by one.",
      priority: "high",
      labels: ["Question", "Exports"],
      note: "The difference is refunds: the VAT report deducts refunded tax in the period of the refund, the order export shows tax as charged at order time. Their refunded tax last quarter is exactly €635.74 in Metabase.",
      resolution:
        "Thanks {name}, both are correct but they answer different questions. The VAT report subtracts the tax you refunded during the quarter (€635.74 for you), while the order export shows tax as charged when each order was placed. Use the VAT report for the return; the refunds export for the same dates shows the €635.74 line by line if your accountant wants to reconcile.",
    },
    {
      title: "Gift card export has no remaining balance column",
      description:
        "Gift cards > Export gives code, initial value and created date, but not the remaining balance, which is the one thing our accountant needs for the liability.",
      priority: "low",
      labels: ["Bug", "Exports"],
      note: "`balance` was left out of the column list when gift cards moved to the new exporter. One-line fix, Hana opened PR #4107.",
      resolution:
        "The gift card export now includes `balance` and `last_used_at`. Run it again from Gift cards > Export and you'll find both columns at the end.",
    },
    {
      title: "Product import fails: handle already exists",
      description:
        "I'm trying to update prices for our autumn range with a CSV. I exported the products, changed the `Variant Price` column and imported the same file back. It fails on every row with:\n\n`Row 2: Handle 'merino-crew-navy' already exists`\n\nHow am I supposed to update products if the import won't accept existing handles?",
      priority: "medium",
      labels: ["Question", "Imports"],
      note: "They're importing in the default 'Create new products' mode. Update mode is the 'Overwrite products with matching handles' checkbox on step 2 of the import.",
      resolution:
        "On the second step of the import, tick Overwrite products with matching handles. With that on, rows whose handle already exists update the product instead of failing, so your exported file with the new prices will go through as it is.",
    },
    {
      title: "Import created duplicate variants instead of updating stock",
      description:
        "We update stock and prices once a week with a CSV from our ERP. Since this week's import, a lot of products show each size twice on the storefront, one with stock and one with 0.\n\nSteps:\n1. Products > Import, file `weekly_update.csv` (4,212 rows), 'Overwrite products with matching handles' ticked\n2. Import finishes with 'Updated 1,388 products'\n3. Open handle `trail-runner-gtx`: sizes 42, 43 and 44 now exist twice\n\nOur ERP now exports sizes as `42.0` instead of `42`. Could that be it? Either way the import should not create a second size 42. Customers are picking the empty variant and getting a sold-out error at checkout.\n\n```\nHandle,Option1 Name,Option1 Value,Variant SKU,Variant Inventory Qty\ntrail-runner-gtx,Size,42.0,TR-GTX-42,18\n```",
      priority: "high",
      labels: ["Bug", "Imports"],
      note: "Variant matching uses option values, not SKU, so `42.0` != `42` and a new variant gets created. Matching on `Variant SKU` when present would have prevented it. Tomás is running a cleanup script on their store that merges variants sharing a SKU.",
      resolution:
        "Hi {name}, your guess was right: the import matched variants by option value, so `42.0` was treated as a new size. We've merged the duplicate variants on your store, keeping the stock from the new rows, and the import now matches on `Variant SKU` first when it's present, so a format change in your ERP can't do this again.",
    },
    {
      title: "Inventory import zeroed all stock at our Rotterdam warehouse",
      description:
        "We did an inventory import one hour ago only for our Utrecht store, and now all products that ship from Rotterdam are showing 0 stock. The whole webshop says 'Sold out' for around 1,600 SKUs. In the CSV was only the `Utrecht` column with quantities, we did not touch Rotterdam at all. Please help urgent, we are losing orders every minute.",
      priority: "urgent",
      labels: ["Bug", "Imports"],
      note: "Import treats location columns missing from the file as 0 instead of unchanged. Regression from Monday's release (PR #4152). Tomás restored Rotterdam quantities from the pre-import inventory snapshot at 11:42.",
      resolution:
        "Your Rotterdam stock is back: we restored it from the snapshot taken right before your import, and the storefront is selling again. A bug in this week's release set locations that weren't in the file to 0; it's been rolled back, so importing a single location's column is safe again. Sorry for the lost hour of sales.",
    },
    {
      title: "Prices with comma decimals rejected on import",
      description:
        "Our product sheet comes from a German Excel, so the prices are written like `12,50`. On import we get:\n\n```\nRow 14: Variant Price '12,50' is not a valid number\nRow 15: Variant Price '8,90' is not a valid number\n...\n312 errors\n```\n\nSteps:\n1. Save as CSV from Excel (German locale, separator `;`)\n2. Products > Import, choose the file\n3. Preview shows the columns correct, so the `;` is detected\n4. Import fails on every price\n\nIf the importer detects `;` as separator it should also know that `,` is the decimal. We have 300+ products and replacing the commas by hand breaks the descriptions, which have commas too.",
      priority: "medium",
      labels: ["Bug", "Imports"],
      note: "Delimiter sniffing works but number parsing is hard-coded to `.`. Hana added a Decimal separator select to the import step, defaulting to `,` when the delimiter is `;`.",
      resolution:
        "Thanks {name}, the importer now has a Decimal separator option, and it picks comma automatically when the file uses semicolons like yours. Your original export from German Excel should import without any changes.",
    },
    {
      title: "Product images from Dropbox links not imported",
      description:
        "We put Dropbox share links in the `Image Src` column. The products import fine but without any images. The links open fine in the browser.",
      priority: "low",
      labels: ["Question", "Imports"],
      note: "Dropbox links with `?dl=0` return an HTML preview page, not the image. Our fetcher gets `text/html` and skips it silently, which we should at least report.",
      resolution:
        "Dropbox share links ending in `?dl=0` open a preview page rather than the image itself, so the importer can't use them. Change the ending to `?dl=1` in the `Image Src` column and import again; the images will be downloaded.",
    },
    {
      title: "Import stuck at 0% for three hours",
      description:
        "Product import has shown 'Processing 0%' since this morning and we can't start another one because it says an import is already running. We have a launch at 6pm!",
      priority: "high",
      labels: ["Bug", "Imports"],
      note: "The job was picked up by a worker that got recycled during the deploy, and the lock row in `import_jobs` stayed `running`. Priya cleared the lock and re-queued it; it finished in 4 minutes.",
      resolution:
        "The import got stuck when one of our servers restarted during a deploy, and its lock stayed behind. We cleared it and re-ran your file: 842 products updated, and you can start new imports again. Imports now release the lock on their own if this ever happens again.",
    },
    {
      title: "Customer import ignores the Tags column",
      description:
        "We are moving from our old platform and imported 12,400 customers with a `Tags` column (values like `vip, newsletter-2019`). All customers were created but none of them has tags. The template from your help center also calls the column `Tags`, so I think it is not a naming problem from our side.\n\nThank you in advance for checking.",
      priority: "medium",
      labels: ["Bug", "Imports"],
      note: "Customer importer expects lowercase `tags`; the product importer is case-insensitive, the customer one isn't. Our own help center template uses `Tags`.",
      resolution:
        "Hi {name}, you did it right: the customer importer was matching column names case-sensitively and expected `tags`. It's now case-insensitive like the product importer. Import the same file again with Update existing customers ticked and the tags will be added without creating duplicates.",
    },
    {
      title: "Please add a preview step before an import applies",
      description:
        "Twice now a CSV from our supplier had a shifted column and we only found out after the import had changed 500 products.\n\nA step that shows 'X products will be created, Y updated, these fields will change' before anything is saved would have saved us a full day each time. Even a dry run that emails a report would help.",
      priority: "medium",
      labels: ["Feature request", "Imports"],
      note: "The back-office importer already has `--dry-run`, it's just not exposed in the admin. Tomás thinks a created/updated summary is small; a full field diff isn't.",
      resolution:
        "Thanks {name}, you're not the first to ask for this. I've added your vote to the import preview request, and a first version with created and updated counts is planned for next quarter. Until then, exporting your products right before an import gives you a file to restore from if something goes wrong.",
    },
    {
      title: "Import error doesn't say which row is wrong",
      description:
        "Our variant import fails with only this message:\n\n`Validation failed: Invalid value in column Option2 Value`\n\nThe file has 2,900 rows. Which row? Which value? We spent an hour cutting the file in halves to find that row 1,847 had `XL ` with a trailing space, while the product has `XL`.\n\nExpected: the error shows the row number and the value, like price errors already do (`Row 14: Variant Price ...`).\n\nNot urgent anymore since we found it, but please improve this.",
      priority: "low",
      labels: ["Bug", "Imports"],
      note: "Option value errors come from the variant validator, which throws before the row context is attached. Priya repro'd with a trailing space. We should probably trim option values too.",
      resolution:
        "Option value errors now include the row number and the exact value, the same as price errors. We also trim spaces at the start and end of option values, so `XL ` would now match `XL` and your file would have gone through.",
    },
    {
      title: "Import wiped our SEO descriptions",
      description:
        "Yesterday we imported a CSV to change prices on 640 products. The file only had `Handle`, `Variant SKU` and `Variant Price`. After the import every one of those products has an empty SEO title and SEO description, and Google Search Console already reports missing meta descriptions.\n\n1. Export products\n2. Delete all columns except Handle, Variant SKU, Variant Price\n3. Change prices, import with overwrite on\n4. SEO fields on those products are now blank\n\nYour help center says columns that aren't in the file are not changed. That is clearly not true for SEO fields. Can you restore them? We wrote every one of those by hand.",
      priority: "high",
      labels: ["Bug", "Imports"],
      note: "SEO fields are product-level and the product upsert writes `null` for any SEO column not present in the file. Tomás can restore from the nightly product snapshot; their SEO values are in the one from the night before.",
      resolution:
        "Hi {name}, we restored the SEO titles and descriptions on all 640 products from the backup taken the night before your import. The bug is fixed too: SEO fields now stay unchanged when they aren't in the file, as the help center says. Search Console may take a few days to pick up the restored descriptions.",
    },
    {
      title: "Owner locked out after losing her 2FA phone",
      description:
        "Our store owner lost her phone over the weekend, and with it the authenticator app. She never saved the backup codes. She's the only account with owner access, and she needs to approve the payout details change our bank asked for. How can we get her 2FA reset?",
      priority: "high",
      labels: ["Question", "Permissions"],
      note: "Owner 2FA resets need identity verification per the runbook (video call plus ID matching the billing contact). Maya did the call; reset done from back-office > Staff > Reset 2FA.",
      resolution:
        "The 2FA reset is done: the next time she logs in she'll be asked to set up two-factor authentication again. Please have her keep the new backup codes somewhere safe, and consider giving a second person full permissions so one lost phone can't lock the store.",
    },
    {
      title: "Fulfillment staff can see revenue on the dashboard",
      description:
        "Our warehouse team has the Fulfillment role, which should only show orders to ship. Since the new home dashboard they see the Total sales and Average order value cards with real numbers. We don't want temporary warehouse staff seeing our revenue. Is there a setting we missed?",
      priority: "high",
      labels: ["Bug", "Permissions"],
      note: "New dashboard cards check `orders:read` instead of `analytics:read`. Repro'd with a Fulfillment test user on staging; Hana has the fix in PR #4063.",
      resolution:
        "Hi {name}, you didn't miss a setting: the new dashboard was checking the wrong permission. It's fixed, and staff with the Fulfillment role now only see the orders to ship card. Nothing else was exposed; reports and payouts stayed hidden from that role the whole time.",
    },
    {
      title: "Can't remove ex-employee, he still has admin access",
      description:
        "We let a staff member go this morning. When I try to remove him in Settings > Staff I get 'Something went wrong' and he stays in the list. His account has full permissions and he is still logged in: the activity log shows him editing products 20 minutes ago. Please cut his access now.",
      priority: "urgent",
      labels: ["Bug", "Permissions"],
      note: "`DELETE /staff/:id` returns 500 because he authored scheduled price changes and the foreign key blocks the delete. Priya suspended the account and revoked his sessions from back-office within 5 minutes; Tomás is changing delete to hand scheduled jobs to the owner.",
      resolution:
        "We've suspended his account and signed him out of every session, so he no longer has access. Removing him failed because he had scheduled price changes; those now pass to the store owner, and removing staff in that situation works. Check the activity log for what he changed this morning, and we can help you revert any of it.",
    },
    {
      title: "SAML login fails for all staff after Okta certificate rotation",
      description:
        "Nobody on our team can log in to the admin since 08:15. We use SSO with Okta. Our IT rotated the Okta signing certificate this morning and uploaded the new one in Settings > Security > SAML, as described in your docs.\n\nWhat happens:\n1. Click 'Log in with SSO'\n2. Okta login works\n3. The redirect back to Brightcart shows `SAML_SIGNATURE_INVALID: Response signature could not be verified`\n\nWe uploaded the certificate again as PEM and as raw base64, same error. 40 people can't work, including customer service and the warehouse. Our owner has a password login but she is on a plane. Please help asap.",
      priority: "urgent",
      labels: ["Bug", "Permissions"],
      note: "SAML config caches the IdP metadata for 24h and ignores the uploaded cert until the cache expires. Hana flushed `saml_idp_cache` for their store and logins work; bug filed to invalidate the cache on upload.",
      resolution:
        "Hi {name}, logins are working again. We were still using a cached copy of your old Okta certificate after the new one was uploaded; we cleared it for your store and fixed the upload so a new certificate takes effect straight away. Sorry for the lost morning.",
      tier: "enterprise",
    },
    {
      title: "Can we force 2FA for all staff?",
      description:
        "Our insurer asks whether we enforce two-factor authentication for everyone with admin access. Is there a setting for that?",
      priority: "low",
      labels: ["Question", "Permissions"],
      note: "Setting exists under Settings > Security. Staff without 2FA get prompted at their next login.",
      resolution:
        "Yes: go to Settings > Security and turn on Require two-factor authentication. Staff who haven't set it up are asked to at their next login and can't reach the admin until they do. The Staff page shows who has 2FA enabled, which is handy evidence for your insurer.",
    },
    {
      title: "Staff invite email never arrives",
      description:
        "I've invited our new bookkeeper three times since Monday. She gets nothing, not in spam either. Her address is on our company domain and our other emails reach her fine.",
      priority: "medium",
      labels: ["Bug", "Permissions"],
      note: "Postmark shows the invites bounced: their mail server rejects `notify.brightcart.example` for DMARC alignment after the sender change last week. Priya found six more stores hitting the same thing.",
      resolution:
        "Our invite emails were being rejected by your company's mail server because of a sender setting on our side, which is now fixed. I re-sent the invitation and it should be in her inbox. If not, the Staff page has a Copy invite link option you can send her directly.",
    },
    {
      title: "Custom roles with permissions per admin section",
      description:
        "The built-in roles don't fit us. Our customer service people need to edit orders and issue refunds up to a limit, but shouldn't see products or discounts. Right now we either give them Manager (too much) or Support (can't refund).\n\nCould we build our own roles, choosing permissions per section? Refund limits per role would be ideal.",
      priority: "medium",
      labels: ["Feature request", "Permissions"],
      note: "Custom roles only exist through back-office config, no UI, and refund limits aren't supported anywhere. Maya says it's the most requested staff feature; added to the permissions roadmap doc.",
      resolution:
        "Thanks {name}, I've added your case to the custom roles request, including refund limits, which is a new angle for us. It's on the roadmap but not scheduled this quarter. Meanwhile, most teams in your situation give agents the Support role and have a Manager approve refunds.",
    },
    {
      title: "New Entra ID users aren't created on first SSO login",
      description:
        "We connected Microsoft Entra ID (Azure AD) with SAML last month. Existing staff can log in without problem. But a new colleague we added to the Brightcart group in Entra gets 'No staff account found for this email' when she logs in.\n\nDo we still need to invite every person manually in Brightcart also?",
      priority: "medium",
      labels: ["Question", "Permissions"],
      note: "Just-in-time provisioning is off by default. Toggle is under Settings > Security > SAML with a default role; Hana confirmed it's off on their store.",
      resolution:
        "You don't need to invite people manually. In Settings > Security > SAML, turn on Create staff accounts on first login and choose the default role for new people. After that, anyone in your Entra group gets an account the first time they sign in, and you can adjust their role afterwards.",
      tier: "enterprise",
    },
    {
      title: "Transfer store ownership to our new managing director",
      description:
        "Our founder is leaving the company at the end of this week, and she is the store owner in Brightcart. We need to transfer ownership to our new managing director, who is already a staff member.\n\nWhat's the process, and can it be done before Friday? After that her email will be deactivated.",
      priority: "high",
      labels: ["Question", "Account changes"],
      note: "Owner can do it herself in Settings > Account > Transfer ownership; new owner must accept within 72h. If she's gone before that, we need the account change form signed by a legal signatory. Maya asked them to start today.",
      resolution:
        "Hi {name}, the current owner can start it in Settings > Account > Transfer ownership and choose your managing director; he accepts from the email he receives, and billing moves with the store. It needs to happen before her email is deactivated, since she confirms the request. If that's no longer possible, reply here and we'll do it through our account change form instead.",
    },
    {
      title: "Legal entity changed after acquisition, update company name",
      description:
        "Our company was acquired and from next month we invoice as a different legal entity with a new VAT number. The store itself stays the same.\n\nWhere do we change the legal name that appears on customer invoices, and on the invoices Brightcart sends us? We don't want to open a new store and lose our order history.",
      priority: "medium",
      labels: ["Question", "Account changes"],
      note: "Two separate things: store legal details (merchant can edit in Settings > Store details) and the Brightcart billing entity (account change form plus proof, handled by Billing). Sent them the form; Priya forwarded to Billing.",
      resolution:
        "No need for a new store. The name and VAT number on your customers' invoices are in Settings > Store details > Legal entity, and you can change them yourself on the day of the switch. For the invoices Brightcart sends you, fill in the account change form I've emailed you and attach the acquisition document; our billing team will update it from your next invoice.",
    },
    {
      title: "Change our store domain after a rebrand",
      description:
        "We're rebranding and moving to a new domain next month. Can we change the primary domain and keep the old one redirecting? We don't want to lose our Google rankings.",
      priority: "low",
      labels: ["Question", "Account changes"],
      note: "Standard domain change: add the new one, set as primary, old one 301s automatically. Only catch is the email sender domain needs verifying again.",
      resolution:
        "Hi {name}, add the new domain in Settings > Domains and, once it's connected, click Set as primary. The old domain stays attached and redirects every page to the same path on the new one with a 301, so your rankings carry over. Verify the new domain for sending emails as well, otherwise order emails keep coming from the old one.",
    },
    {
      title: "Can you merge our UK and EU stores into one?",
      description:
        "We run two Brightcart stores, one in GBP for the UK and one in EUR for the EU, from before multi-currency existed. We'd like to merge them into a single store with both currencies, keeping customers and order history from both.\n\nIs that something you can do on your side? Happy to schedule it whenever suits you.",
      priority: "medium",
      labels: ["Question", "Account changes"],
      note: "We don't merge stores: order, customer and payment IDs collide. Tomás can migrate products and customers into the surviving store; the closed store's order history stays readable in read-only mode.",
      resolution:
        "We can't merge two stores into one, because orders and payments are tied to the store they were placed in. What we can do is move products and customer accounts from your EU store into the UK store, which then sells in both currencies, and keep the EU store read-only so its order history stays available. If that works for you, reply and we'll plan it for a quiet evening.",
      tier: "enterprise",
    },
    {
      title: "Ownership transfer link says invalid or expired",
      description:
        "I got the email to accept store ownership yesterday. When I click Accept it says 'This link is invalid or has expired'. It hasn't been 72 hours yet.",
      priority: "medium",
      labels: ["Bug", "Account changes"],
      note: "Accept link double-encodes the token when the new owner's email contains a `+`; his address is `ops+store@`. Hana fixed the encoding and re-sent the invitation.",
      resolution:
        "Thanks {name}, the link broke because of the `+` in your email address, which we weren't encoding properly. That's fixed and we've re-sent the ownership invitation; the new link works and is valid for 72 hours.",
    },
    {
      title: "Old store name still on packing slips",
      description:
        "We renamed our store two weeks ago. Invoices and emails show the new name, but packing slips still show the old one.",
      priority: "low",
      labels: ["Bug", "Account changes"],
      note: "Packing slips use a cached render of the store header, keyed by store id and never invalidated on rename.",
      resolution:
        "Packing slips were using a saved copy of your store header that didn't refresh when you renamed the store. We've cleared it, and renaming a store now updates packing slips straight away.",
    },
    {
      title: "We closed the wrong store, please reopen it",
      description:
        "I meant to close our old test store and closed our live store instead. The site shows 'This store is unavailable'. Please reopen it immediately, we are in the middle of a sale!!",
      priority: "urgent",
      labels: ["Question", "Account changes"],
      note: "Closed 7 minutes before the ticket came in; closures are soft for 30 days. Priya reopened from back-office > Store > Reopen, payments reconnected and a test order went through.",
      resolution:
        "Your store is open again and checkout works; we placed a test order to be sure. Closing a store keeps everything for 30 days, so nothing was lost. Reply with the test store's name if you'd like us to close that one for you.",
    },
    {
      title: "Close our store and delete all customer data",
      description:
        "We're closing the business at the end of the month. We'd like to close the Brightcart store and make sure all customer data is deleted, as our privacy policy promises.\n\nDo we have to delete customers one by one first? And can we still download our orders for our accountant after closing?",
      priority: "low",
      labels: ["Question", "Account changes", "Data request"],
      note: "Close store, 30-day soft period, then the retention job hard-deletes personal data. They must export orders before closing; after the hard delete only anonymised invoices remain for tax retention.",
      resolution:
        "Hi {name}, you don't need to delete customers one by one. Export your orders and customers first (Orders > Export and Customers > Export), then close the store in Settings > Account. After 30 days we permanently delete all customer data; only anonymised invoice records we must keep for tax purposes remain. All the best with what comes next.",
    },
    {
      title: "Shopper asked for all the data we hold on her",
      description:
        "A customer sent us a GDPR subject access request and we have 30 days to answer. She wants everything: orders, addresses, emails we sent her, and anything from our apps.\n\nHow do we get this out of Brightcart? I couldn't find a button for it anywhere.",
      priority: "medium",
      labels: ["Question", "Data request"],
      note: "Customer page > ... > Request customer data builds a JSON + CSV package and emails it to the store owner. Doesn't cover data held by third-party apps; they'll need to ask Klaviyo separately.",
      resolution:
        "Open the customer in Customers, click the ... menu and choose Request customer data. Within an hour the store owner receives a download with her profile, addresses, orders and the emails we sent on your behalf. Data held by apps you've connected, like your email marketing tool, isn't included, so request that from those apps directly.",
    },
    {
      title: "Deleted customer still getting Klaviyo emails",
      description:
        "A customer asked us to delete her data and we did it in Brightcart last week (Customers > Delete). Today she wrote again, very angry, because she received our weekly Klaviyo newsletter. She says she will complain to the data protection authority.\n\nDoesn't deleting a customer in Brightcart reach Klaviyo?",
      priority: "high",
      labels: ["Bug", "Data request", "Integrations"],
      note: "Deletion sends `customers/redact` to connected apps, but the Klaviyo connector only unsubscribes the profile and never calls Klaviyo's data privacy deletion endpoint. Hana confirmed in the connector logs.",
      resolution:
        "Thanks {name}, it should have. Our Klaviyo connector only unsubscribed deleted customers instead of deleting them there; it now requests a full deletion in Klaviyo, and we've run it for her and for every customer your store deleted before the fix. If she asks, you can confirm her data is gone from both systems.",
    },
    {
      title: "Audit log export for our ISO 27001 audit",
      description:
        "Our ISO 27001 surveillance audit is next week and the auditor wants evidence of who changed staff permissions and payment settings over the last 12 months.\n\nThe audit log in Settings shows events but I can't find an export, and it only goes back 90 days. Can you provide the full year?",
      priority: "medium",
      labels: ["Question", "Data request", "Exports"],
      note: "Admin UI shows 90 days; we keep 13 months in cold storage. Tomás pulled `staff_permission_changed` and `payment_settings_changed` for their store for 12 months into a CSV.",
      resolution:
        "The admin only shows the last 90 days, but we keep audit events for 13 months. I've attached a CSV with every permission and payment settings change on your store over the past 12 months, including the staff member, IP address and time of each change. You can ask us for the same file any time.",
      tier: "enterprise",
    },
    {
      title: "Audit log doesn't show changes made through the API",
      description:
        "We're trying to find out why prices on 90 products changed last night. The audit log shows nothing between 18:00 and 09:00. We think it was our ERP integration, which uses an API key, but the audit log only seems to show changes made by people.\n\nWhat we checked:\n- Settings > Audit log, filter Products, last 24h: 3 events, all from staff\n- The products show 'Updated 2:14 AM' in the list\n- Settings > Apps > API keys shows the 'ERP sync' key was last used at 2:14 AM\n\nExpected: changes made with an API key appear in the audit log, with the key name as the actor.",
      priority: "medium",
      labels: ["Bug", "Data request"],
      note: "API-key writes skip the audit middleware because it keys off `session.staffId`. Priya confirmed with a test key; Tomás is adding `api_key:<name>` as the actor.",
      resolution:
        "Thanks {name}, you were right: changes made with an API key weren't recorded in the audit log. They are now, with the key's name as the actor. For last night, our internal logs show the 90 price changes came from your 'ERP sync' key between 02:13 and 02:15.",
      tier: "enterprise",
    },
    {
      title: "Who deleted our summer collection?",
      description:
        "The whole Summer collection (about 140 products) disappeared from the admin this morning and nobody here admits deleting it. Can you tell us who did it, and can you bring it back? It's linked from our homepage and from the newsletter that went out today.",
      priority: "high",
      labels: ["Question", "Data request"],
      note: "Audit log: `collection.deleted` by the staff account 'Store tablet' at 07:52 from the shop's IP. Products weren't touched, only the collection; restored it from the deleted items bin with the same handle.",
      resolution:
        "The collection was deleted at 07:52 by the staff account called 'Store tablet', from your shop's IP address. The products themselves were never deleted, and we've restored the collection with the same URL, so your homepage and newsletter links work again. You may want to give that shared account a more limited role.",
    },
    {
      title: "Xero posting every order twice since we reconnected",
      description:
        "Our Xero connection expired last week and we reconnected it on Monday. Since then every order shows up twice in Xero as two invoices, for example INV-20418 and INV-20419 are both order 771032.\n\nOur bookkeeper has already deleted about 150 duplicates by hand and wants to know it has stopped before she carries on.",
      priority: "high",
      labels: ["Bug", "Integrations"],
      note: "Reconnect created a second connection record instead of replacing the old one, so two sync jobs run per order. Tomás removed the stale connection; no duplicates after 14:30.",
      resolution:
        "Hi {name}, reconnecting created a second Xero connection next to the old one, so each order was sent twice. We removed the old connection and fixed reconnecting so it replaces it. There are no new duplicates since 14:30 today; the earlier ones still need deleting, and we can send your bookkeeper a list if that helps.",
    },
    {
      title: "QuickBooks maps PST to the wrong tax rate",
      description:
        "We sell in Canada and sync orders to QuickBooks Online. For orders shipped to British Columbia, Brightcart charges GST 5% + PST 7% correctly, but in QuickBooks the invoices show GST 5% and 'PST (SK)' 6%, so the tax is off and doesn't match the payment.\n\nExample, order 309914, subtotal CA$240.00:\n- Brightcart: GST $12.00, PST $16.80, total $268.80\n- QuickBooks: GST $12.00, PST (SK) $14.40, plus a $2.40 adjustment line\n\nOur QuickBooks has both 'PST (BC)' and 'PST (SK)' tax codes. Saskatchewan orders are fine. It looks like the integration picks the first PST it finds?",
      priority: "medium",
      labels: ["Bug", "Integrations"],
      note: "The QBO connector matches tax codes by name prefix 'PST'. Hana changed it to match by province code and added a tax mapping screen to the integration settings.",
      resolution:
        "Thanks {name}, your guess was right: the integration used the first tax code starting with 'PST'. It now matches by province, and you can check the mapping under Settings > Integrations > QuickBooks > Tax mapping. New orders sync correctly; for past ones, click Resync on the order and QuickBooks gets a corrected invoice.",
    },
    {
      title: "Mailchimp sync stopped: audience not found",
      description:
        "Our Mailchimp integration shows `Sync failed: 404 Audience not found` since Tuesday. We didn't delete anything in Mailchimp. New customers aren't being added.",
      priority: "medium",
      labels: ["Bug", "Integrations"],
      note: "Their Mailchimp account merged two audiences, which changes the list ID, and we still store the old one. Not broken on our side, but the error should tell them how to fix it.",
      resolution:
        "The audience ID changed in Mailchimp (this happens when audiences are merged or recreated), and we were still syncing to the old one. In Settings > Integrations > Mailchimp, pick the audience again and click Save; customers added since Tuesday will sync in the next run. The error message now explains this too.",
    },
    {
      title: "Klaviyo order events missing product images",
      description:
        "In Klaviyo the Placed Order event has an empty `ImageURL` for every item, so our order follow-up emails show grey boxes.",
      priority: "low",
      labels: ["Bug", "Integrations"],
      note: "Connector sends the variant's own image; most of their variants don't have one and we never fall back to the product image. Small fix.",
      resolution:
        "Items now fall back to the product's main image when the variant has none, so `ImageURL` is filled on new events. Events already in Klaviyo won't change, so follow-up emails look right for orders from today on.",
    },
    {
      title: "Zapier New Order trigger fires for draft orders",
      description:
        "Our Zap sends every new order to our warehouse system. Since last week it also fires for the draft orders our sales team creates as quotes. The warehouse has already shipped two of them (drafts D1048 and D1052), which were never paid.",
      priority: "high",
      labels: ["Bug", "Integrations"],
      note: "Draft orders started emitting `orders/create` after the drafts refactor in PR #4015, and the Zapier trigger subscribes to that. Tomás is moving drafts back to `draft_orders/create` only.",
      resolution:
        "Hi {name}, since last week's update draft orders were wrongly sending the same event as real orders. That's fixed, and the New Order trigger fires only for placed orders again. If your sales team does want drafts in Zapier, there's a separate New Draft Order trigger.",
    },
    {
      title: "Slack order alerts stopped after moving workspace",
      description:
        "We moved our team to a new Slack workspace and the 'New order over €500' alerts don't show up anymore. The old workspace is deleted.",
      priority: "low",
      labels: ["Question", "Integrations"],
      note: "Slack app is still bound to the old workspace's token. Needs a reconnect on their side, nothing broken.",
      resolution:
        "The alerts were still connected to your old workspace. In Settings > Integrations > Slack, click Disconnect, then Connect and choose the new workspace and channel. Your alert rules are kept, so they'll start posting again right away.",
    },
    {
      title: "ERP sync gets 429 errors every night",
      description:
        "Our ERP syncs stock and prices to Brightcart every night at 01:00 using an API key. For the last week the job fails halfway with rate limit errors, and in the morning about a third of our products have the wrong stock.\n\nFrom our logs:\n\n```\n01:07:12 PUT /api/v2/variants/88213401 -> 429 Too Many Requests\n01:07:12 X-RateLimit-Limit: 40  X-RateLimit-Remaining: 0  Retry-After: 2\n```\n\nThe job sends about 18,000 requests, one per variant. Nothing changed on our side. What is the limit, and did it change?",
      priority: "high",
      labels: ["Question", "Integrations"],
      note: "Limit is 40 req/s per key; the old gateway never enforced it per key, the new one does since last week's migration. They should use `POST /variants/bulk` (250 per call).",
      resolution:
        "Thanks {name}, the limit is 40 requests per second per API key. It's been documented for a while, but our new API gateway only started enforcing it last week. The bulk endpoint (`POST /api/v2/variants/bulk`, up to 250 variants per call) brings your nightly sync down to about 75 requests; if your ERP can't batch, respecting `Retry-After` will let the current job finish, just more slowly.",
    },
    {
      title: "orders/updated webhook not sent when fulfillment changes",
      description:
        "Our warehouse system listens for `orders/updated`. When an order is marked fulfilled in the admin, we receive the webhook. When the fulfillment is created by our shipping app through the API, no webhook arrives, so our system thinks the order is still open and customer service sees the wrong status.\n\nSteps:\n1. Create a fulfillment with `POST /api/v2/orders/:id/fulfillments`\n2. The order shows Fulfilled in the admin\n3. No `orders/updated` delivery under Settings > Webhooks > Deliveries\n\nExpected: the same webhook as when fulfilling in the admin. Affected orders include 610224, 610231 and 610288.",
      priority: "high",
      labels: ["Bug", "Integrations"],
      note: "The fulfillment API writes through the repository directly and skips the domain event the admin action fires. Tomás moved the event into the service and is backfilling deliveries for their store.",
      resolution:
        "Hi {name}, fulfillments created through the API weren't triggering `orders/updated`, only ones made in the admin. That's fixed, and we re-sent the missing webhooks for your orders from the past two weeks, so your warehouse system should now show the right status for 610224, 610231 and the rest.",
    },
    {
      title: "Read-only API key for our BI tool",
      description:
        "We want to connect Power BI to pull our orders. Can we create an API key that can only read, not change anything?",
      priority: "low",
      labels: ["Question", "Integrations", "Permissions"],
      note: "Scoped keys exist, they just default to all scopes. Pointed them at the scopes list on key creation.",
      resolution:
        "Yes: in Settings > Apps > API keys, click Create key and under Scopes select only the read permissions you need, for example Orders: read and Products: read. That key can't change anything, and you can revoke it any time from the same page.",
    },
    {
      title: "Webhooks disabled, warehouse not receiving any orders",
      description:
        "Our warehouse hasn't received a single order since last night. In Settings > Webhooks all our endpoints say 'Disabled after repeated failures'. Our endpoint had a 20 minute outage around 23:00 but it's been up since.\n\nOver 300 orders are waiting and the trucks leave at 14:00. How do we turn them back on and get the missed orders?",
      priority: "urgent",
      labels: ["Bug", "Integrations"],
      note: "Endpoints auto-disable after 20 consecutive failures, and there's no re-enable button for system-disabled endpoints, only manual ones. Priya re-enabled them from back-office and replayed 342 deliveries from the queue.",
      resolution:
        "Your webhooks are back on, and we re-sent the 342 orders your warehouse missed, so they should all be there now. Endpoints are switched off after 20 failed deliveries in a row; you can now turn them back on yourself with the Enable button on each endpoint, which also offers to replay what was missed.",
    },
    {
      title: "Please build a native NetSuite integration",
      description:
        "We moved our finance to NetSuite. Right now we use a middleware (Celigo) that costs us nearly as much as our Brightcart plan and breaks every few weeks.\n\nA native connector like the Xero and QuickBooks ones, covering orders, refunds and payouts, would be very welcome.",
      priority: "low",
      labels: ["Feature request", "Integrations"],
      note: "NetSuite is at 11 requests in the tracker. Maya says partnerships is talking to a connector vendor; no native build planned.",
      resolution:
        "Thanks {name}, I've added your vote to the NetSuite request. A native connector isn't planned for this year, but we're talking to a partner about a certified one, and I'll let you know if that becomes available.",
    },
    {
      title: "Webhook signatures fail after rotating the secret",
      description:
        "We rotated the webhook signing secret in Settings > Webhooks yesterday afternoon and updated it in our app. Since then roughly half of the webhooks fail our HMAC check and we reject them. Our verification code hasn't changed in two years:\n\n```ts\nconst digest = createHmac('sha256', secret).update(rawBody).digest('base64');\nif (digest !== req.headers['x-brightcart-hmac-sha256']) return res.status(401).end();\n```\n\nIt looks like some deliveries are still signed with the old secret. Orders are piling up in our retry queue.",
      priority: "high",
      labels: ["Bug", "Integrations"],
      note: "Delivery workers cache the signing secret per endpoint for up to 24h, so warm workers kept signing with the old one. Tomás wants a proper rotation window: old secret valid 24h and a second signature header during it.",
      resolution:
        "Hi {name}, some of our delivery servers kept signing with your old secret for hours after the rotation. We've cleared that, and every delivery is now signed with the new one. For future rotations, the old secret stays valid for 24 hours and we send both signatures during that window, so you can switch without rejecting anything.",
    },
    {
      title: "Orders list shows late-evening orders under the next day",
      description:
        "We changed our store time zone from UTC to America/Chicago when we moved the business. Order pages now show the right local time, but the orders list and the Today filter still group by UTC.\n\nOrders placed after 7pm our time show up under the next day, so our daily count is always wrong.",
      priority: "medium",
      labels: ["Bug"],
      note: "Orders list date filter uses `created_at::date` in the database (UTC) instead of converting to the store time zone; the dashboard Today card has the same bug. Hana's fix is behind `orders_list_store_tz`, now on for them.",
      resolution:
        "Thanks {name}, the orders list and the Today filter now use your store's time zone, like the order pages already did. Evening orders appear under the right day, and your daily counts should match from today.",
    },
    {
      title: "Net sales in report don't match Stripe payouts",
      description:
        "Last month's Sales report says net sales $58,240.15. Our Stripe payouts for the same month add up to $55,904.62. Our bookkeeper wants to know where the $2,335.53 went.",
      priority: "medium",
      labels: ["Question"],
      note: "Usual suspects: report is by order date, payouts lag two days, and Stripe fees. Fees on their 1,020 charges come to $1,996.20; the rest is timing at both ends of the month.",
      resolution:
        "The two numbers measure different things: the Sales report counts orders by the date they were placed, while payouts are what Stripe sends a couple of days later, after its fees. Stripe fees last month were $1,996.20, and the remaining $339.33 is timing around the start and end of the month. Analytics > Reports > Payout reconciliation lines them up order by order for your bookkeeper.",
    },
    {
      title: "Orders page won't load, 504 after 30 seconds",
      description:
        "Since about 10:00 the Orders page loads for 30 seconds and then shows `504 Gateway Timeout`. Single orders open fine from the links in notification emails, but we can't see the list, so the team can't pick and pack anything. We have 600 orders to ship today.",
      priority: "urgent",
      labels: ["Bug"],
      note: "Their default view sorts by `total_price` with an 'Any tag' filter, and that query lost its index in this morning's migration (`idx_orders_store_total` dropped by mistake). Tomás recreated it concurrently; p95 back to 400ms.",
      resolution:
        "The Orders page is loading again. A database index was removed by mistake during maintenance this morning, and your default view depended on it; we've recreated it and the page loads in under a second now. Sorry for the lost packing time.",
    },
    {
      title: "Unfulfilled filter includes fulfilled orders",
      description:
        "The Unfulfilled filter shows orders that were already shipped. Two got packed and shipped twice yesterday because of it.",
      priority: "high",
      labels: ["Bug"],
      note: "Those orders got a free gift line added by an order edit after shipping, which makes them `partially_fulfilled`, and the filter treats partial as unfulfilled. Maya thinks zero-value items added later shouldn't reopen fulfillment at all.",
      resolution:
        "Hi {name}, those orders had a free item added after shipping through an order edit, which made them count as partly unfulfilled. They now show under Partially fulfilled instead, and free items added after shipping no longer reopen an order that has already gone out.",
    },
    {
      title: "Admin is a blank white page in Firefox",
      description:
        "Since this morning the admin only shows a white page in Firefox. Our PCs are managed by IT and all run Firefox ESR 115, we cannot install another browser. The console says:\n\n`TypeError: Promise.withResolvers is not a function`\n\nNobody in customer service or the warehouse can work.",
      priority: "urgent",
      labels: ["Bug"],
      note: "This morning's admin build dropped the polyfill for `Promise.withResolvers`, which ESR 115 doesn't have. Hana shipped a hotfix with the polyfill back and added ESR 115 to our browserslist.",
      resolution:
        "Thanks {name}, fixed: this morning's update relied on a browser feature Firefox ESR 115 doesn't support. The fix is live, so a normal reload brings the admin back, and ESR 115 is now part of our browser tests.",
    },
    {
      title: "Bulk editor hangs when saving 200 variants",
      description:
        "Steps:\n1. Products > select all 38 products in the Knitwear collection\n2. Bulk edit > Variants view, about 210 rows\n3. Change `Compare at price` on all rows (pasted a column from Excel)\n4. Click Save\n\nActual: the button spins forever. After 5 minutes we reload, and about half of the variants have the new price and half the old one. No error message.\n\nExpected: everything saves, or it tells us what failed.\n\nWith 50 rows it works. Chrome 128 on macOS. In the network tab, `PATCH /admin/api/bulk/variants` stays pending and then fails with `net::ERR_HTTP2_PROTOCOL_ERROR`.",
      priority: "medium",
      labels: ["Bug"],
      note: "Bulk save sends every row in one PATCH; above about 150 variants it runs past the 60s proxy timeout and the proxy resets the stream while the server keeps going, hence the half-saved state. Tomás is chunking saves into 50-row batches with progress.",
      resolution:
        "The bulk editor now saves in batches of 50 and shows progress, so large edits no longer time out halfway, and if a batch fails you'll see which rows weren't saved. For the Knitwear edit, pasting the column again and saving once more will update the remaining variants.",
    },
    {
      title: "Please add a dark mode to the admin",
      description:
        "Our evening shift works in a dim warehouse office and the white admin is very bright. A dark mode would be nice.",
      priority: "low",
      labels: ["Feature request"],
      note: "The design system has dark tokens but lots of admin pages still hard-code backgrounds. Not on the roadmap; logged with their use case.",
      resolution:
        "Thanks for the suggestion, I've logged it with your use case. A dark mode for the admin isn't on the roadmap yet, as many pages would need reworking. In the meantime, Chrome's Auto Dark Mode for Web Contents setting can darken it, though some charts may look off.",
    },
    {
      title: "Customer search doesn't find phone numbers",
      description:
        "Searching customers by phone only works if I type it exactly as saved, with +44 and the spaces. Typing `07700 900123` finds nothing.",
      priority: "low",
      labels: ["Bug"],
      note: "Search matches the raw `phone` string. New customers are stored in E.164 but imports kept their original formatting. Normalising the query and indexing E.164 fixes both.",
      resolution:
        "Customer search now ignores spaces and dashes in phone numbers and matches national formats against international ones, so `07700 900123` finds `+44 7700 900123`. It works for customers imported from your old platform too.",
    },
    {
      title: "Top products report counts refunded items",
      description:
        "We use the Top products report to decide what to reorder. According to the report our best seller last month is the Aero 2 helmet with 312 units. But we had a batch recall and refunded 118 of them.\n\nWhat I expected:\n- Units sold minus refunded units, or at least a separate refunded column\n\nWhat I see:\n- Units: 312\n- Net sales went down after the refunds, but units didn't\n\nSo the report tells us to reorder a product we just recalled.",
      priority: "medium",
      labels: ["Bug"],
      note: "Units come from `order_line_items.quantity` while net sales subtract `refund_line_items`, so the two columns disagree. Priya checked `refund_line_items.quantity` is populated, so it's just a query change.",
      resolution:
        "Thanks {name}, the report now subtracts refunded units and has a Units refunded column next to it, so you can still see both. For last month, the Aero 2 helmet now shows 194 net units.",
    },
    {
      title: "Logged out of the admin every 15 minutes",
      description:
        "Since Tuesday we get logged out of the admin every 15 minutes or so, in the middle of editing products. Happens to all 4 of us, Chrome and Safari. Third time this week I lose a half-written product description.",
      priority: "medium",
      labels: ["Bug"],
      note: "Their office proxy rotates egress IPs, and the new session-to-IP binding (flag `session_ip_binding`) kills the session on every change. Priya turned it off for their store; the real fix will bind to a network range.",
      resolution:
        "Hi {name}, a new security check tied admin sessions to a single IP address, and your office network switches between addresses, which logged you out. We've turned that check off for your store while we change it to allow changes within the same network, so the logouts should stop now.",
    },
    {
      title: "Show SKU as a column in the orders list",
      description:
        "It would be really useful to see SKUs directly in the orders list instead of opening every order. Our pickers ask for this every week.",
      priority: "low",
      labels: ["Feature request"],
      note: "Orders list columns aren't configurable yet; configurable columns has 23 votes. Showing line items per row needs design work. Maya logged it.",
      resolution:
        "I've added your vote to the configurable columns request for the orders list; it isn't planned for this quarter. Meanwhile, the pick list (select orders > Print > Pick list) shows SKUs and quantities for all selected orders on one page.",
    },
    {
      title: "Let us pick which columns go in the order export",
      description:
        "The order export has 74 columns and we use 9 of them. Every week someone deletes the other 65 before sending the file to our fulfillment partner, and sometimes deletes the wrong one.\n\nCould the export dialog let us choose the columns and save that as a template?",
      priority: "medium",
      labels: ["Feature request", "Exports"],
      note: "Column selection already exists in the API (`fields` on `/exports`) but not in the UI. Tomás says saved templates are part of the background exports work.",
      resolution:
        "Hi {name}, I've added your request to export templates. Choosing columns and saving them is part of the export work we're doing now, likely landing next quarter. If you're comfortable with the API, `POST /api/v2/exports` already accepts a `fields` list, which gives you exactly those 9 columns.",
    },
    {
      title: "Support SCIM so leavers lose Brightcart access",
      description:
        "We use Okta SSO with Brightcart and it works well. But when someone leaves and IT deactivates them in Okta, their Brightcart staff account stays active and keeps its API tokens. We audit this every quarter and always find a few.\n\nSCIM provisioning, or at least deprovisioning, would close that gap for us.",
      priority: "medium",
      labels: ["Feature request", "Permissions"],
      note: "SSO blocks new logins for deactivated users, but existing sessions and personal API tokens survive. SCIM is on the roadmap for next half; Maya added their account to it.",
      resolution:
        "Thanks {name}, I've added your team to the SCIM request; it's on the roadmap for the first half of next year. Until then, Settings > Staff > Last login shows accounts that haven't signed in through SSO recently, and removing a staff member there also revokes their API tokens.",
      tier: "enterprise",
    },
    {
      title: "Send audit log events to our SIEM",
      description:
        "Our security team wants admin events from Brightcart (logins, permission changes, new API keys) in Splunk with our other systems. Is there a webhook or log stream for the audit log? Scraping the admin page is not an option for us.",
      priority: "medium",
      labels: ["Feature request", "Data request"],
      note: "No audit webhooks today. A generic HTTPS log stream (Splunk HEC compatible) was scoped last year and parked. Maya added their vote; that's three requests now.",
      resolution:
        "There's no way to stream audit events yet, but I've added your vote to the request, and with several security teams asking it's being looked at again for next year. Until then, we can send your security team a monthly CSV of your store's audit events on request.",
      tier: "enterprise",
    },
    {
      title: "Zapier trigger for new refunds, please",
      description:
        "We'd like a Zapier trigger when a refund is created, so we can log refunds in a Google Sheet for finance. Right now there's only New Order and Order Updated.",
      priority: "low",
      labels: ["Feature request", "Integrations"],
      note: "The `refunds/create` webhook exists, it's just not exposed in our Zapier app. Small change to the app definition; Hana will bundle it with the next Zapier release.",
      resolution:
        "Hi {name}, a New Refund trigger is going into our next Zapier app update in the coming weeks. Until it's out, the Webhooks by Zapier trigger with our `refunds/create` webhook gives you the same data.",
    },
  ],
  threads: [
    {
      title: "Full order history export times out or comes back truncated",
      description:
        "We need a CSV of all our orders since we moved to Brightcart (a bit over three years, around 430,000 orders) for our external auditor. The year-end audit fieldwork starts soon and the auditor wants the complete order history with line items and refunds.\n\nWhat we tried:\n1. Orders > Export, date range All time, template Orders - line items\n2. After about one minute: `Export failed. Try a smaller date range.`\n3. Tried again late in the evening: this time we got the email with a download link, but the file stops at row 212,904 and the last line is cut in the middle of an address\n\nOne year at a time: the oldest year works, the last two years fail the same way. We cannot give the auditor something incomplete. Please advise how we get the full file.",
      priority: "high",
      labels: ["Bug", "Exports"],
      status: "in_progress",
      assigneeId: "tomas-silva",
      organizationId: "vantage-electronics",
      quietForHours: 5,
      messages: [
        {
          kind: "internal_note",
          authorId: "priya-nair",
          afterMinutes: 40,
          body: "Repro'd from back-office on their store: the All time line-items export dies after exactly 60s with `canceling statement due to statement timeout` in the export worker logs. 431k orders, around 1M line rows. Assigning to Tomás, this is beyond what we can fix from support.",
        },
        {
          kind: "public_reply",
          afterMinutes: 55,
          body: "Hi Mateusz, I'm Tomás from the back-office engineering team and I'm taking this over.\n\nI can reproduce both problems on your store: the export stops after 60 seconds for large date ranges, and when it does finish, the file can be cut short. Please don't send the 212,904-row file to your auditor, it's incomplete. I'm digging into it today and will update you by tomorrow morning at the latest.",
          statusChange: "in_progress",
        },
        {
          kind: "internal_note",
          afterMinutes: 210,
          body: "Two separate problems:\n\n1. The export runs as one query (orders + line items + refunds + transactions) on the reporting replica, which has `statement_timeout = 60s`. All time for this store needs about 6 minutes.\n2. When it does get under the timeout (at night, quiet replica), the worker builds the whole CSV in memory, hits the 2 GB limit and gets OOM-killed. The upload step in the `finally` block then uploads whatever was written and emails the link as if it succeeded. That's the truncated file.\n\n(2) is the worse bug: we're silently sending incomplete files. Opening a PR to mark the job failed when the worker exits early.",
        },
        {
          kind: "customer_message",
          afterMinutes: 1300,
          body: "Thank you Tomás. To be clear about our timeline: the auditor needs the complete file by Friday next week, their fieldwork starts the Monday after.\n\nIf there is no fix by then, can you generate the file on your side and send it to us? The format is not so important, one CSV per year or per quarter is fine, as long as nothing is missing.\n\nMateusz",
        },
        {
          kind: "internal_note",
          authorId: "maya-chen",
          afterMinutes: 25,
          body: "Vantage is one of our biggest Enterprise accounts and their account manager has already pinged me about this. Let's not wait for the real fix: Tomás, can you run it per quarter from the back-office runner and we send the files manually? Priya, please ask them not to re-run All time from the admin, every attempt hammers the reporting replica for everyone.",
        },
        {
          kind: "public_reply",
          afterMinutes: 40,
          body: "Yes, we can do that. The plan: I'll run the export per quarter on our side (13 files, one per quarter since you joined), check each file against your order counts, and send them through a secure download link. Please don't start the All time export from the admin in the meantime, it can't succeed yet.\n\nBefore I start, two questions:\n\n1. Which template does the auditor need: Orders - line items (one row per product) or Orders - summary (one row per order)?\n2. Should the quarters follow the calendar year, or does your financial year start in a different month?",
          statusChange: "blocked",
        },
        {
          kind: "customer_message",
          afterMinutes: 190,
          body: "Line items please, the auditor wants to sample individual products. Our financial year is the calendar year, so normal quarters are fine.\n\nPlease send the password for the files separately, our IT policy requires this. And thank you for the fast help.",
          statusChange: "in_progress",
        },
        {
          kind: "internal_note",
          afterMinutes: 45,
          body: "Running the per-quarter exports from the back-office runner with `statement_timeout` raised to 15 min for this job only, writing straight to disk instead of memory. First quarter as a test: 41,380 orders, 3m52s, last line intact. Queued the other 12 for after 22:00 so we stay off the replica during EU peak.",
        },
        {
          kind: "internal_note",
          authorId: "priya-nair",
          afterMinutes: 900,
          body: "All 13 quarterly files are done. Checked row counts against Metabase: 431,206 orders and 1,018,774 line item rows, every quarter matches, and the last line of every file is complete. Zipped with AES-256 and uploaded to the secure share, link expires in 7 days.",
        },
        {
          kind: "public_reply",
          afterMinutes: 35,
          body: "Hi Mateusz, the files are ready: 13 CSVs, one per quarter from your first order on Brightcart up to yesterday, with 431,206 orders and 1,018,774 line item rows in total. We checked every file against the order counts in our database and none of them is cut off.\n\nDownload: https://share.brightcart.example/d/7Qm2x9 (expires in 7 days). The password goes by SMS to the phone number on your account, as your IT asked.\n\nIn parallel we're rebuilding large exports to run as a background job, in chunks and without the 60-second limit. Once that's live you'll be able to export All time from the admin yourself.",
        },
        {
          kind: "customer_message",
          afterMinutes: 3900,
          body: "Hello Tomás, we downloaded everything, the files open without problems and our finance team checked the totals of four quarters against the ledger. They match, thank you.\n\nOne problem: the auditor asks where the refunds are. The export from the admin has the columns `refunded_amount` and `refund_date`, in your files they are missing. Without them they cannot reconcile net revenue. Can you add them? The deadline is still Friday.",
        },
        {
          kind: "internal_note",
          afterMinutes: 60,
          body: "He's right. The back-office runner uses the v1 line-items template, which predates the refund columns (`refunded_amount`, `refund_date`, `refund_reason`). v2 joins `refund_line_items` again, which was the slowest part of the original query, so I'll run it per month instead of per quarter to stay well under the timeout.",
        },
        {
          kind: "internal_note",
          authorId: "maya-chen",
          afterMinutes: 30,
          body: "Their account manager says Friday can't move, the auditor won't budge. Tomás, let's aim for Thursday end of day on the refund files so they have a buffer. How far is the background export job? If it's close I'd rather they get that than another manual batch next quarter.",
        },
        {
          kind: "internal_note",
          afterMinutes: 20,
          body: "Background job is PR #4231, in review: chunks of 10k orders streamed to storage, behind `exports_background_jobs`. Needs a few more days of testing on large stores and I'm not rushing it for Friday; the manual rerun is the safer path.",
        },
        {
          kind: "public_reply",
          afterMinutes: 25,
          body: "Sorry about that, Mateusz. The runner we used on our side had an older column set without the refund columns. I'm re-running every period now with `refunded_amount`, `refund_date` and `refund_reason` included, per month this time so each file stays small. You'll have the new link by Thursday afternoon, a day before your deadline.\n\nThe background export is in review and we'll switch it on for your store first once it's tested, probably next week.",
        },
        {
          kind: "customer_message",
          afterMinutes: 1400,
          body: "OK, Thursday works for us. One more question from the auditor: when an order has two partial refunds, is that one row with the sum or two rows? They need to know how to read the file.",
        },
        {
          kind: "internal_note",
          afterMinutes: 900,
          body: "Refund rerun is at 22 of 40 months, no timeouts so far. On partial refunds: v2 sums them per line item in `refunded_amount` and keeps only the latest `refund_date`, which won't be enough for the auditor. Adding `refund_count` and a separate refunds file with one row per refund so they can reconcile. I'll answer Mateusz together with the link.",
        },
      ],
    },
  ],
};
