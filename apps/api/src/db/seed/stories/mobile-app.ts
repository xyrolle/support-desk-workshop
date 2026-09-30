import type { ProjectStories } from "../story.ts";

export const mobileAppStories: ProjectStories = {
  stories: [
    {
      title: "App crashes on launch after updating to 5.11.0",
      description:
        "Since 5.11.0 went live on the App Store yesterday we are getting one-star reviews saying the app closes immediately. I checked on my own iPhone and it's true.\n\nSteps:\n1. Have 5.10.3 installed, logged in, with something in the cart\n2. Update to 5.11.0 from the App Store\n3. Open the app\n\nExpected: home screen\nActual: splash screen for about a second, then the app closes. Every time.\n\nDeleting and reinstalling fixes it, but we can't ask 40,000 app customers to do that. Seen on iPhone 13, 14 and 15 with iOS 17.6 and 18.0.",
      priority: "urgent",
      labels: ["Bug", "iOS", "Crash"],
      note: "Sentry has 2,300 crashes in the Core Data store migration since the release, all from users upgrading from 5.10.x with a saved cart. The 5.11 model renamed `CartLine.variantId` without a mapping model, so the lightweight migration throws. Sam is building 5.11.1 with the mapping and requesting an expedited review.",
      resolution:
        "Hi {name}, 5.11.1 is live on the App Store and fixes the crash. The update failed while converting saved carts from the old version; customers only need to update, not reinstall, and their carts are kept. Thanks for reporting it so quickly, it made a real difference.",
    },
    {
      title: "What works in the app without internet?",
      description:
        "A customer asked if she can browse our app on the plane. What exactly works offline, can they still add to cart?",
      priority: "low",
      labels: ["Question"],
      note: "Offline mode caches categories, the last 200 viewed products and the cart for 7 days. Add to cart works offline and syncs on reconnect; search and checkout need a connection. Hana's help center article on this is still a draft, so answering by hand.",
      resolution:
        "Good question. Without a connection customers can browse categories and the last products they viewed (up to 200, kept for a week), and add them to the cart; the cart syncs when they're back online. Search, checkout and products they haven't opened before need a connection.",
    },
    {
      title: "Android customers are never asked to allow notifications",
      description:
        "Our push audience on Android has been flat for two months while iOS keeps growing. I installed the app fresh on a Pixel 8 and it never asks to allow notifications. In the Android settings, notifications are off for our app by default.\n\nOn iPhone the prompt comes after the first order like it should.",
      priority: "high",
      labels: ["Bug", "Android", "Push notifications"],
      note: "Android 13+ needs the runtime `POST_NOTIFICATIONS` permission, and the Android app only requests it when `push_prompt_timing` is set. Apps created before 5.9 have it empty, this one included, so the prompt never shows. Set it to `after_first_order`; Olivia confirmed the prompt on a Pixel 8 with Android 14.",
      resolution:
        "Found it: since Android 13 apps have to ask for notification permission, and your app was set up before we added that setting. It's switched on now, so Android customers see the prompt after their first order, like on iPhone. Customers who have already ordered will see it once, after their next order.",
    },
    {
      title: "Send a push only to customers with a certain tag",
      description:
        "We tag our customers in the admin (VIP, wholesale, staff and so on). It would be very useful to send a push only to VIP customers, for example for early access to a sale. Right now the push composer only lets us choose all users, platform, country or language.\n\nIs this possible or planned? Klaviyo can do it for emails, so our marketing team expected the same for push.",
      priority: "medium",
      labels: ["Feature request", "Push notifications"],
      note: "Push audiences are built from the device table, which doesn't know about customer tags. Sam says it becomes easy once audiences move to the segment service, and that isn't scheduled before next quarter. Added this as a vote on the existing request.",
      resolution:
        "Not possible yet: push audiences can be filtered by platform, country, language and app version, but not by customer tags. It's on our roadmap but not planned for this quarter; I've added your vote and the VIP example to the request. Until then, a Klaviyo email to your VIP segment with a link that opens the app is the closest option.",
    },
    {
      title: "All prices show 0,00 € in the app!!",
      description:
        "Every product in our app shows 0,00 € since about 20 minutes. The website shows correct prices. Customers are already sending us screenshots. Please help fast!!",
      priority: "urgent",
      labels: ["Bug"],
      note: "Mobile catalog API has returned `price.amount` as a string since the pricing service deploy at 14:05, and the app's decoder falls back to 0 instead of failing. Rolled the pricing service back at 14:31 and prices are back. Olivia checked on iOS and Android.",
      resolution:
        "The prices are back. A change to our pricing service sent prices in a format the app couldn't read, and the app showed zero instead of an error. Checkout always used the real price, so no order was placed at 0,00 €. We've also changed the app so it never shows a price it can't read.",
    },
    {
      title: "Search finds nothing when the word has an accent",
      description:
        "Searching 'creme' in the app finds our products, but 'crème' finds nothing, while on the website both work. French customers obviously type the accent.",
      priority: "medium",
      labels: ["Bug"],
      note: "The app sends the query URL-encoded twice (`cr%25C3%25A8me`), the web encodes it once. It's in the shared query builder both platforms have used since 5.10. Olivia confirmed on iOS and Android.",
      resolution:
        "Fixed in 5.11.1. The app encoded accented letters twice before sending the search, so 'crème' arrived garbled. Both spellings now return the same results.",
    },
    {
      title: "Our Apple developer membership expires next week",
      description:
        "We got an email from Apple that our Apple Developer Program membership expires in 8 days. The person who set it up left the company last year and nobody knows the login. What happens to our app if it expires? Can Brightcart renew it for us?",
      priority: "high",
      labels: ["Question", "iOS"],
      note: "If the membership lapses the app disappears from the App Store and their APNs key stops working, so pushes stop too. We can't renew it, only the Account Holder can. Apple can transfer the Account Holder role through developer support with the company's D-U-N-S number; Hana sent them the steps.",
      resolution:
        "Hi {name}, if the membership expires Apple removes your app from the App Store and push notifications stop, so it's worth sorting out this week. Only the Account Holder can renew, so we can't do it for you. Since nobody can access that login, contact Apple Developer Support with your company's D-U-N-S number and ask to move the Account Holder role to you; it usually takes a few business days, and after that renewing is one click under Membership.",
    },
    {
      title: "Sign in with Apple fails for every customer",
      description:
        "Since this morning every customer who uses Sign in with Apple gets this error when logging in:\n\n`The operation couldn't be completed. (com.apple.AuthenticationServices.AuthorizationError error 1000.)`\n\nEmail login still works. About a third of our app accounts use Apple, so our inbox is full. We didn't change anything in the app, it's version 5.12.0.",
      priority: "urgent",
      labels: ["Bug", "iOS", "Login"],
      note: "Their App ID has had the Sign in with Apple capability unchecked since last night; someone cleaned up capabilities after renewing the membership. Apple fails the request before it reaches our auth service, hence the generic 1000. Asked them to re-enable it as a primary App ID; no rebuild needed because the entitlement is still in the binary.",
      resolution:
        "Hi {name}, Sign in with Apple works again. The capability had been switched off on your App ID in your Apple developer account, so Apple refused every login before it reached us. Your team switched it back on and no app update is needed. It would help to ask whoever manages that account to check with us before removing capabilities.",
    },
    {
      title: "White screen on Android since last night",
      description:
        "Since last night many Android customers only see a white screen when they open the app. Mostly Samsung, some Pixel. iPhone is fine. We didn't change anything in the app.",
      priority: "urgent",
      labels: ["Bug", "Android"],
      note: "Their home layout got a `video_hero` block last night from the new home editor. Android 5.11.x can't parse it, and the parser throws and leaves the screen blank instead of skipping the block like iOS does. The API now only sends block types an app version supports (`minAppVersion` per type), and Lena is making the Android parser skip unknown blocks.",
      resolution:
        "The app opens normally again, no update needed. The video banner added to your home page last night is a new type of block that older Android versions of the app don't know, and instead of skipping it they showed nothing. We now only send new blocks to app versions that support them, so Android customers will see the video after their next update.",
    },
    {
      title: "Please allow guest checkout in the app",
      description:
        "In the app customers must create an account before they can pay. On the website we offer guest checkout and most first-time customers use it. Our app conversion from cart to order is 1.9% compared to 3.4% on mobile web, and our agency thinks the forced account is the main reason.\n\nCan you add guest checkout to the app? This matters a lot to us, we promote the app in all our campaigns.",
      priority: "high",
      labels: ["Feature request"],
      note: "The blocker is order history and push opt-in without an account. Sam has a design for a 'guest with email' flow that links the device to the order. It's the most requested MOB feature right now (14 merchants) and it's on the roadmap for 5.14.",
      resolution:
        "Thanks {name}, this is on our roadmap: guest checkout in the app is planned for 5.14, and I've added your numbers to the request, they're a strong argument. We'll let you know when it's in beta so you can try it before the release.",
    },
    {
      title: "Flash sale push didn't reach any iPhone",
      description:
        "We sent the flash sale push 30 minutes ago to 18,000 app users. Android customers got it, iOS customers didn't. Nobody in our office with an iPhone got it either. The sale only runs for 6 hours, we need this working now.",
      priority: "urgent",
      labels: ["Bug", "iOS", "Push notifications"],
      note: "APNs has returned `403 InvalidProviderToken` for this app since yesterday afternoon: the .p8 key we sign with was revoked in their developer account (someone thought it was unused). They need to upload a new key in Mobile > Push > Apple. Maya is on a call with them doing it now.",
      resolution:
        "With the new key uploaded we re-sent the flash sale push to your iPhone customers and it's been delivered. The old key had been revoked in your Apple developer account, and Apple rejects every notification signed with it. Mobile > Push now shows a warning as soon as a key stops working.",
    },
    {
      title: "Play Console says we must target API level 35",
      description:
        "We got this warning in Google Play Console:\n\n```\nYour app currently targets API level 34 and must target at least API level 35 to ensure it is built on the latest APIs optimized for security and performance. Update your app's target API level by the deadline or you won't be able to release app updates.\n```\n\nThe deadline shown is in about five weeks. Is this something we have to do, or Brightcart? We don't have developers for the app, we only use the admin. And what do we lose if nothing happens?",
      priority: "high",
      labels: ["Question", "Android", "App review"],
      note: "Target SDK 35 ships in 5.12.0 for every Android app. They're still on 5.11.4 because automatic publishing is off for their store, so they only need to approve the 5.12.0 release. Olivia already verified 5.12.0 against the Android 15 edge-to-edge changes.",
      resolution:
        "Hi {name}, nothing for you to build: 5.12.0 already targets API level 35. Your app is still on 5.11.4 because automatic publishing is off for your store, so once you approve the 5.12.0 release under Mobile > Releases we submit it to Google Play and the warning goes away. If the deadline passed, you'd only lose the ability to publish updates; the current app would stay in the store.",
    },
    {
      title: "Google login loops back to the login screen on Android",
      description:
        "On Android, 'Continue with Google' shows the account picker, then comes back to our login screen like nothing happened. No error for the customer.\n\nSteps:\n1. Log out\n2. Tap Continue with Google\n3. Pick an account\n\nExpected: logged in\nActual: back on the login screen, still logged out\n\nPixel 7 and Galaxy S24, both Android 14, app 5.11.2. iPhone works. Our developer connected a phone and saw this in logcat:\n\n```\nW/GoogleSignIn: signInResult:failed code=10\n```",
      priority: "high",
      labels: ["Bug", "Android", "Login"],
      note: "Code 10 is DEVELOPER_ERROR: the SHA-1 of the Play app signing key isn't registered in the app's Firebase project, only the upload key is. Started when they enrolled in Play App Signing last week. Added the app signing SHA-1 from Play Console > App integrity and it works on Hana's Pixel now.",
      resolution:
        "Hi {name}, fixed without an app update. Google checks which key the app is signed with, and since you moved to Play App Signing, Google Play signs the app with a key that wasn't registered for Google login yet. We've added it, and Google login works again on Android.",
    },
    {
      title: "Order emails bounce for 'Hide My Email' customers",
      description:
        "Some customers sign in with Apple and choose 'Hide My Email'. Their account then has an address like `x7k2p9qd4m@privaterelay.appleid.com`. Our order confirmations to these addresses bounce, so the customers think the order didn't work and write to us.\n\nWhat do we need to do so these emails arrive?",
      priority: "medium",
      labels: ["Question", "iOS", "Login"],
      note: "Apple's private relay only forwards mail from domains registered under Sign in with Apple for Email Communication in the merchant's developer account. They send from `orders@` on their own domain through our mail service, so they need to register that domain and address. Hana is sending the steps.",
      resolution:
        "Thanks {name}. Apple only forwards emails to 'Hide My Email' addresses from domains you've registered with them. In your Apple developer account, go to Certificates, Identifiers & Profiles > Services > Sign in with Apple for Email Communication and add your domain and your `orders@` address. Your SPF record already includes Brightcart's mail servers, so emails will arrive as soon as Apple verifies the domain.",
    },
    {
      title: "Product links from Klaviyo emails open the home screen",
      description:
        "When customers tap a product in our Klaviyo emails on their phone, the app opens but always on the home screen, not the product. On a computer the same link opens the right product page on the website.\n\nA big part of our email revenue comes through the app, so this hurts. It started maybe two weeks ago, we're not sure exactly.",
      priority: "high",
      labels: ["Bug"],
      note: "Klaviyo's link editor adds a trailing slash, so the app receives `/products/<handle>/` and the route matcher only accepts `/products/<handle>`, falling back to home. Repro'd with and without the slash on both platforms. Lena fixed the matcher in PR #4930.",
      resolution:
        "Klaviyo adds a slash at the end of links, and the app didn't recognise product links ending in a slash, so it fell back to the home screen. That's fixed in 5.11.3, and once customers update, email links open the right product.",
    },
    {
      title: "Can our developer see the app's crash reports?",
      description:
        "Our developer would like to look at the crash reports of our app, like in Crashlytics. Is there a way to get access?",
      priority: "low",
      labels: ["Question", "Crash"],
      note: "Crashlytics and Sentry live in our org and include our internal symbol files, so no direct access. Mobile > Health has crash-free users and the top crashes per version, which is usually enough, and they have App Store Connect and Play Console vitals in their own accounts.",
      resolution:
        "We don't give direct access to our crash tools, but Mobile > Health in the admin shows your crash-free users and the top crashes for each app version. Your developer can also see crash data in App Store Connect and in Play Console under Android vitals, since the apps are in your own accounts. If something there looks off, send us the version and we'll dig into our full reports.",
    },
    {
      title: "Links open Safari instead of the app since our domain change",
      description:
        "Since we moved the store to our new domain last week, links to our shop open in Safari even when the app is installed. Before, they opened the app directly. We get a lot of traffic from SMS and Instagram that used to land in the app.",
      priority: "high",
      labels: ["Bug", "iOS"],
      note: "Two problems: the new domain isn't in the app's Associated Domains entitlement (needs a build), and their CDN redirects `/.well-known/apple-app-site-association` to the home page, so Apple can't fetch it. Asked them to exclude `/.well-known/` from the redirect; Sam is building with `applinks:` for both domains.",
      resolution:
        "5.11.4 includes your new domain, and with the redirect on `/.well-known/` removed Apple can read the file it checks. Links open the app again for customers on the new version. iPhones cache this, so for some customers it can take up to a day or a restart of the phone.",
    },
    {
      title: "Support passkeys for customer login",
      description:
        "Could the app support passkeys? More and more customers ask for it, and our web team is adding passkeys to the web store soon. It would be strange if the app still needs a password or the email link. Many of our customers are older and forget their passwords all the time.",
      priority: "medium",
      labels: ["Feature request", "Login"],
      note: "Passkeys need `webcredentials:` associated domains on iOS, Digital Asset Links on Android and WebAuthn support in the customer accounts service, which isn't scheduled. Sam estimates the app side at about two sprints once the backend exists. Logged on the passkeys request.",
      resolution:
        "We want passkeys too, but they depend on changes to customer accounts that aren't scheduled yet, so I can't give you a date. I've added your request and the context about your web launch. In the meantime, turning on the email login link under Mobile > Login helps customers who forget their password.",
    },
    {
      title: "Can you speed up our App Store review?",
      description:
        "Our update has been 'Waiting for Review' for three days now. We have a campaign starting Friday that needs the new version (new category pages). Can you do something to speed it up?",
      priority: "medium",
      labels: ["Question", "App review"],
      note: "The new category pages are CMS layouts, and the version that's live (5.11.4) already renders them. They don't need the update for the campaign at all. Checked their store on Olivia's test iPhone and Pixel.",
      resolution:
        "Hi {name}, good news: you don't need the update for Friday. The new category pages are built in the admin, and the version that's live now already shows them; we checked your store on an iPhone and an Android phone. The update is in Apple's normal queue and should be reviewed within a day or two, but nothing in your campaign depends on it.",
    },
    {
      title: "Crash when opening a product with a video",
      description:
        "The app crashes every time you open a product that has a video in the gallery. Only on iPhone. About 120 of our products have a video, all affected. App 5.11.1, iOS 18.0.",
      priority: "high",
      labels: ["Bug", "iOS", "Crash"],
      note: "Sentry issue MOB-IOS-3312: the `AVPlayerItem` KVO observer is removed twice when the gallery cell is reused. Only on iOS 18, because autoplay now starts before the cell is on screen. Olivia repro'd on an iPhone 14; fix in PR #4952.",
      resolution:
        "Apple approved 5.11.2 this morning, and it fixes the crash. On iOS 18 the video player was cleaned up twice when the gallery scrolled, and the second time crashed the app. Products with videos open normally once customers update.",
    },
    {
      title: "Keyboard hides the postcode field in checkout",
      description:
        "On Android the keyboard covers the postcode and city fields in checkout, and you can't scroll down to them. Galaxy A54.",
      priority: "medium",
      labels: ["Bug", "Android"],
      note: "`windowSoftInputMode` is `adjustPan` on the checkout activity, and with edge-to-edge the IME inset isn't applied to the form's scroll view. Olivia repro'd on the A54 with Android 14 and on a Pixel 9 with 15. Fix goes into 5.12.0.",
      resolution:
        "Fixed in 5.12.0: the checkout form now scrolls up when the keyboard opens, so postcode and city stay visible. Thanks for the device details, the A54 was where we could reproduce it every time.",
    },
    {
      title: "Who owns the app in the App Store, us or you?",
      description:
        "Our CFO asks who owns the app in the App Store and Google Play, us or Brightcart. If we leave Brightcart one day, what happens with the app and all the reviews?",
      priority: "low",
      labels: ["Question"],
      note: "Pro and Enterprise apps are published from the merchant's own developer accounts, with us added as App Manager on iOS and as an admin in Play Console. Listings, reviews and download history are theirs; only the app code is ours.",
      resolution:
        "You do. The app is published from your own Apple and Google developer accounts, and Brightcart is added as a team member that uploads builds. The store listings, reviews, ratings and download history all belong to you, and if you ever left, they'd stay yours and you'd publish a different app build to the same listing.",
    },
    {
      title: "Every push arrives twice on Android",
      description:
        "Our Android customers get every push notification twice, a few seconds apart. Some have turned notifications off because of it. iPhone users get one. I think it started with the 5.11 update.",
      priority: "high",
      labels: ["Bug", "Android", "Push notifications"],
      note: "5.11 moved Android to the FCM HTTP v1 API and registered a new token, but the push service kept the legacy token active for the same installation. Deduplicating by installation ID now; the cleanup job removed 21k stale tokens for this store.",
      resolution:
        "Fixed on our side. After 5.11 many Android phones were registered twice for notifications, once the old way and once the new way, so each push was delivered twice. We removed the old registrations and made sure a phone can only be registered once, so your next campaign goes out once per device.",
    },
    {
      title: "Apple rejected our update because it crashed on iPad",
      description:
        "Apple rejected our update with this message:\n\n> Guideline 2.1 - Performance - App Completeness. We found that your app crashed on iPad Air (5th generation) running iPadOS 18.0 when we tapped on Account.\n\nWe don't even target iPad. Our new collection launches next Thursday and we need the update for it. What can we do quickly?",
      priority: "high",
      labels: ["Bug", "iOS", "App review"],
      note: "App Review's crash log is in App Store Connect: the Account screen presents a `UIAlertController` action sheet without a `sourceView`, which crashes on iPad. Fixed in PR #4899, and Sam resubmitted 5.11.2 (812) with a note to the reviewer.",
      resolution:
        "Hi {name}, the fixed build was approved this morning and is ready for you to release. On iPad, a menu on the Account screen opened in a way that only works on iPhone, and Apple's reviewer happened to test on an iPad. We now test every submission on an iPad as well.",
    },
    {
      title: "How do I test a push before sending it to everyone?",
      description:
        "Last week we sent a push with a broken link to all 25,000 app users. Very embarrassing. Is there a way to send a push only to my own phone first, to check the text, the image and where it opens?",
      priority: "medium",
      labels: ["Question", "Push notifications"],
      note: "Test devices exist under Mobile > Push > Test devices (register by scanning a QR code with the app installed), but almost nobody finds them. Hana suggested linking to them from the composer; filed it with Lena.",
      resolution:
        "Hi {name}, yes: go to Mobile > Push > Test devices and scan the QR code with your phone while the app is installed, and your phone becomes a test device. In the push composer you'll then see 'Send test' next to 'Schedule', which only sends to your test devices. You can add up to 20, so colleagues can check on iPhone and Android at the same time.",
    },
    {
      title: "Scheduled push went out three hours early",
      description:
        "We scheduled the new arrivals push for 9:00 AM and it went out at 6:00 AM. We're in California. Customers replied that we woke them up, and we had more unsubscribes than usual. Is the scheduler using New York time?",
      priority: "high",
      labels: ["Bug", "Push notifications"],
      note: "Yes: the scheduler falls back to the Brightcart region time zone (America/New_York) when 'send in customer's local time' is off, a regression from the scheduler rewrite. PR #5015 fixes it. Corrected their two upcoming scheduled pushes by hand in the meantime.",
      resolution:
        "Hi {name}, you're right, the scheduler used Eastern time instead of your store's time zone. It's fixed, and we've checked your two upcoming scheduled pushes: both now show the correct send time in Pacific time.",
    },
    {
      title: "Wishlists are empty after updating to 5.12.0",
      description:
        "After updating to 5.12.0 several customers wrote to us that their wishlist is empty. Some had 30+ items saved, and they are logged in! Is it gone forever? One customer said she had been collecting ideas for months.",
      priority: "high",
      labels: ["Bug"],
      note: "Wishlists for logged-in customers are synced server side, but 5.12.0 reads from the new `/v2/wishlist` endpoint, and the backfill for this store never finished (stuck on a product with a deleted variant). Reran it with skip-on-error: 4,810 wishlists restored.",
      resolution:
        "Hi {name}, nothing was lost. The update reads wishlists from a new place, and copying the old wishlists there hadn't finished for your store. It has now, and customers see their saved items again after pulling to refresh on the Wishlist tab.",
    },
    {
      title: "Home screen widget for order tracking",
      description:
        "Would be nice to have an iPhone home screen widget that shows where the order is, some big brands have it. Just an idea for the future.",
      priority: "low",
      labels: ["Feature request", "iOS"],
      note: "A widget needs a shared App Group and background refresh of order status. Not hard, but only this merchant and one other have asked. Logged.",
      resolution:
        "Thanks for the idea, {name}. I've logged it as a feature request; with only a few merchants asking it isn't planned yet, but requests like this are how we decide what comes next. Order status push notifications cover most of the same need in the meantime.",
    },
    {
      title: "3-D Secure payments stuck on a white page",
      description:
        "Card payments that need 3-D Secure are failing in the app. Customer taps Pay, the bank page opens, they approve in their banking app, and then they're stuck on a white page with a spinner. The order is never created. Web checkout works fine.\n\nWe've had 60+ abandoned checkouts like this since yesterday afternoon, mostly customers in the UK and Germany where almost every card asks for 3DS.",
      priority: "urgent",
      labels: ["Bug"],
      note: "Yesterday's payments deploy moved the 3DS return to `pay.brightcart.example/3ds/return`, but the in-app browser only closes itself on the old `/checkout/3ds-complete` path, so the customer sits on our return page. Rolled back the return path for mobile sessions. Olivia confirmed with a 3DS test card on iOS and Android.",
      resolution:
        "Hi {name}, fixed on our side, no app update needed. A change to our payment service yesterday moved the page the bank sends customers back to, and the app didn't recognise the new address, so it never closed the bank page. Customers who got stuck weren't charged: those payments were only authorised, and the hold is released automatically.",
    },
    {
      title: "Sold out sizes can be added to cart in the app",
      description:
        "In the app customers can add sold out sizes to the cart and only find out at checkout. On the website the size is greyed out. Example from yesterday:\n\n1. Product SKU 30418-NVY, size M, stock 0 in the admin\n2. In the app, size M is selectable and 'Add to cart' works\n3. At checkout: `This item is no longer available in the selected size`\n\nWe had several complaints this week, a few customers think we're playing games with stock. iPhone and Android both.",
      priority: "high",
      labels: ["Bug"],
      note: "The app caches product detail for 30 minutes for offline mode and doesn't refresh inventory when the product opens; web always fetches live. Lowering the TTL wouldn't fully fix it, so Lena is adding a live stock call when the size selector opens.",
      resolution:
        "5.11.4 checks live stock as soon as a customer opens the size selector, so sold out sizes are greyed out in the app like on your website. Before, the app could show stock that was up to 30 minutes old.",
    },
    {
      title: "Store locator map is just grey on Android",
      description:
        "The 'Find a store' map is only grey on Android, the list of stores below it is there. On iPhone the map shows normally.",
      priority: "medium",
      labels: ["Bug", "Android"],
      note: "Maps SDK logs `Authorization failure`: their Maps API key is still restricted to the old package name from before the app moved to their own Play account. They need to add the new package name and SHA-1 to the key in Google Cloud console.",
      resolution:
        "After your team added the app's new package name to the Maps API key in Google Cloud, the map loads again. The key was still limited to the package name the app had before it moved to your own account. No app update needed.",
    },
    {
      title: "Google Play warning about photo and video permissions",
      description:
        "Got this in Play Console under Policy status:\n\n```\nPhotos and videos permissions policy: Your app uses READ_MEDIA_IMAGES. Only apps with a core use case requiring broad access to photos may use this permission. Submit a declaration or remove the permission.\n```\n\nWhy does our app need access to photos? We just sell products. Do we fill in the declaration, or will you remove it? We don't want the app to be blocked.",
      priority: "medium",
      labels: ["Question", "Android", "App review"],
      note: "READ_MEDIA_IMAGES comes from 'add a photo to your review'. Since 5.11 that uses the Android photo picker, which needs no permission, but the manifest still merged it from the old image picker library. Sam removed it for 5.12.0; they just need to publish that.",
      resolution:
        "No declaration needed. The permission came from photo uploads in product reviews, which now use Android's photo picker and don't need access to the whole gallery. 5.12.0 no longer requests it, so publishing that version clears the warning. Please don't submit the declaration, Google would most likely reject it.",
    },
    {
      title: "Email from Apple about ITMS-91053 missing API declaration",
      description:
        'After our last upload Apple sent this email to our developer account:\n\n```\nITMS-91053: Missing API declaration - Your app\'s code in the "Frameworks/BCImageCache.framework/BCImageCache" file references one or more APIs that require reasons, including the following API categories: NSPrivacyAccessedAPICategoryFileTimestamp.\n```\n\nThe app was approved anyway. Is this a problem? Do we need to do something?',
      priority: "medium",
      labels: ["Question", "iOS", "App review"],
      note: "Our image cache framework reads file modification dates for eviction and its privacy manifest doesn't declare a reason. Needs `C617.1` in BCImageCache's `PrivacyInfo.xcprivacy`; Sam added it for 5.12.2. Apple only warns today but will start rejecting.",
      resolution:
        "This one is on us, not you. One of our frameworks reads file dates to manage its image cache and didn't declare why, which Apple now asks every app to do. The declaration is included in 5.12.2, so the email won't come back after your next update, and the version that's live now isn't affected.",
    },
    {
      title: "PayPal opens a blank page in app checkout",
      description:
        "The PayPal button in the app checkout opens a white page and nothing loads, iPhone only. Customers have to pay by card or give up.",
      priority: "high",
      labels: ["Bug", "iOS"],
      note: "PayPal's login page now sends `Cross-Origin-Opener-Policy: same-origin` and won't render in our WKWebView popup, so it has to open in `ASWebAuthenticationSession`. Sam's PR #5061, going into 5.12.0.",
      resolution:
        "PayPal works again in the latest update: it now opens in a secure browser sheet instead of inside the checkout page, which PayPal stopped allowing. Customers see the normal PayPal login and are brought back to the order confirmation afterwards.",
    },
    {
      title: "Fingerprint login stopped working on Samsung phones",
      description:
        "Since the Android 14 update on Samsung phones, fingerprint login in our app doesn't work. Customers get this message and have to type their password:\n\n`Biometric authentication is not available on this device`\n\nWhat we tested:\n- Galaxy S23, Android 14: fails\n- Galaxy A54, Android 14: fails\n- Pixel 8, Android 14: works\n- iPhone with Face ID: works\n\nApp version 5.11.2. Unlocking the phone itself with the fingerprint works fine on the Samsungs.",
      priority: "high",
      labels: ["Bug", "Android", "Login"],
      note: "One UI 6 reports `BIOMETRIC_STRONG` as unavailable for some fingerprint sensors, and we require STRONG. Unlocking the stored session only needs `BIOMETRIC_WEAK`, since the token stays in the Keystore anyway. Olivia repro'd on the A54; Sam's change goes into 5.11.3.",
      resolution:
        "Thanks {name}, 5.11.3 fixes fingerprint login on Samsung phones with Android 14. The update changed how Samsung reports its fingerprint sensors, and the app wrongly treated them as missing. Customers who switched biometric login off can turn it back on under Account > Security.",
    },
    {
      title: "Google asks for a D-U-N-S number to verify our account",
      description:
        "Google Play Console asks us to verify our organization with a D-U-N-S number until next month, otherwise the app will be hidden. We are a company in Poland and I never heard about this number. Where do we get it and does it cost money? Can Brightcart do this for us?",
      priority: "medium",
      labels: ["Question", "Android"],
      note: "Standard Play organization verification. A D-U-N-S number is free through Dun & Bradstreet, but new ones can take a few weeks in some countries, so they should start now. We can't verify on their behalf, it's tied to the account owner.",
      resolution:
        "Hi {name}, this has to be done by your company, since the Play developer account is yours. A D-U-N-S number is free: first check whether your company already has one using Dun & Bradstreet's lookup, and if not, request one there, which can take a few weeks in Poland, so it's best to start now. Then enter it in Play Console when asked, and Google usually confirms within a few days.",
    },
    {
      title: "Login link from email says it has expired",
      description:
        "Customers who log in with the email link ('Send me a login link') say the link has expired when they tap it, even straight away.\n\n1. Open the app, tap Log in, enter email, tap 'Send me a login link'\n2. Open the email on the same phone within a minute\n3. Tap the link\n\nExpected: logged in to the app\nActual: the app opens and shows `This link has expired. Request a new one.`\n\nMostly iPhone customers using the Gmail app. With Apple Mail it works. Around 30 complaints this week.",
      priority: "high",
      labels: ["Bug", "Login"],
      note: "Gmail's link scanning fetches the URL before the customer taps it, which uses up the one-time token. Apple Mail doesn't prefetch. Lena's PR #5010 only consumes the token when the app exchanges it, not on the GET.",
      resolution:
        "Hi {name}, fixed on our side, no app update needed. Gmail opens links in the background to check them for safety, and that used up the one-time login link before your customer tapped it. Login links are now only used when the app itself exchanges them, so scanning doesn't affect them anymore.",
    },
    {
      title: "Let customers choose light or dark mode in the app",
      description:
        "The app follows the phone's dark mode setting, but some customers prefer our store in light mode because product colours look different in dark. Could there be a switch in the account settings?",
      priority: "low",
      labels: ["Feature request"],
      note: "Theme is `system` only today. Adding an override is small on both platforms, mostly design work for the settings row; Lena has a draft but it isn't prioritised.",
      resolution:
        "I've logged this. It's a small change and we'd like to do it, but it isn't scheduled yet. If dark mode makes your products look wrong, you can already set the app to always use light mode for all customers under Mobile > Appearance.",
    },
    {
      title: "App crashes when turning the tablet",
      description:
        "On our Samsung Galaxy Tab the app crashes if you rotate it while on a product page. Our shop staff use tablets in the store to show products to customers, so we notice it a lot. Phones are fine.",
      priority: "medium",
      labels: ["Bug", "Android", "Crash"],
      note: "Crashlytics: `IllegalStateException: Fragment not attached to a context` in the zoom gallery adapter, which keeps a reference to the old activity after rotation. Only tablets, since phones are locked to portrait. Olivia repro'd on the Galaxy Tab in the device lab.",
      resolution:
        "The fix is in 5.11.4. Rotating the screen rebuilt the product page, but the image gallery still pointed to the old one and crashed. Phones are locked to portrait, which is why only your tablets hit it.",
    },
    {
      title: "App crashes when a customer cancels Apple Pay",
      description:
        "When a customer opens Apple Pay and then cancels, the app crashes. The cart is still there when they reopen, but it looks bad and some don't come back.\n\nApp Store Connect shows 400+ crashes this week, this is the top one:\n\n```\nException Type:  EXC_BAD_ACCESS (SIGSEGV)\nThread 0 Crashed:\n0  libobjc.A.dylib   objc_msgSend + 32\n1  PassKit           -[PKPaymentAuthorizationController _didFinish] + 88\n```\n\niPhone 14 and 15, iOS 17.5 and 18.0, app 5.11.1.",
      priority: "high",
      labels: ["Bug", "iOS", "Crash"],
      note: "Our payment coordinator is released as soon as the sheet starts dismissing, and PassKit calls the delegate after that. Only on cancel, because on success we hold a reference until the order is created. Sam keeps the controller alive until `paymentAuthorizationControllerDidFinish` in PR #4977.",
      resolution:
        "Hi {name}, fixed in 5.11.2, now live. When a customer cancelled Apple Pay, the app let go of the payment screen too early and crashed when iOS reported back. The crash count in App Store Connect will go down over the next week as customers update.",
    },
    {
      title: "Discount code says applied but total doesn't change",
      description:
        "In the app, the customer enters code WELCOME15 in the cart, it says 'Code applied', but the total stays the same and they pay full price. On the website it works. We have refunded 6 customers by hand this week already.",
      priority: "high",
      labels: ["Bug"],
      note: "The code is applied to the cart, but checkout creates its session from the cached cart without `discountCodes`. Codes entered in the checkout step itself work fine. Lena fixed it for 5.12.0 and I pulled the list of affected app orders for the merchant.",
      resolution:
        "Hi {name}, fixed in 5.12.0. Codes entered on the cart screen weren't carried over to checkout, so the total didn't change. I've emailed you a list of the 47 app orders from the last month that used a code but paid full price, so you can refund the rest.",
    },
    {
      title: "App purchases missing in Google Analytics",
      description:
        "We connected Firebase to our GA4 property. App users, sessions and screen views show up fine, but purchases are almost empty: GA4 shows 38 app purchases last week, our admin shows 612 app orders.\n\nWhat we checked:\n1. The Firebase project is linked to the GA4 property\n2. In DebugView we see `view_item`, `add_to_cart` and `begin_checkout`\n3. `purchase` only shows up sometimes\n\nIs purchase tracked differently from the other events?",
      priority: "medium",
      labels: ["Question"],
      note: "`purchase` is logged on the order confirmation screen, but orders paid through PayPal or 3DS return straight to the order status screen and skip it. Known gap. Server-side purchase events via Measurement Protocol work if they add an API secret under Mobile > Analytics.",
      resolution:
        "The difference comes from where the event is sent: the app logs `purchase` on the confirmation screen, and orders paid with PayPal or 3-D Secure skip that screen. The reliable option is server-side tracking: create a Measurement Protocol API secret for your app stream in GA4 and paste it under Mobile > Analytics. From then on every app order is sent to GA4 from our servers.",
    },
    {
      title: "Prices formatted three different ways for French customers",
      description:
        "In our app, for customers with their phone in French, prices are shown like this:\n\n- product page: `1.299,00 €`\n- cart: `1 299,00 €`\n- checkout: `€1,299.00`\n\nSo three formats in the same order. Correct French is `1 299,00 €`. Some customers asked if they will pay 1,299 or 1.299. Same for customers in Belgium. On the website it's correct everywhere.",
      priority: "medium",
      labels: ["Bug"],
      note: "Three different formatters: the product page uses the store's default locale, the cart uses the device locale, and the checkout web view uses `en-US` because `Accept-Language` isn't forwarded. Lena is moving all three to the shared `formatMoney` with device locale and store currency.",
      resolution:
        "Hi {name}, fixed in 5.12.0: product page, cart and checkout now format prices the same way, using the customer's phone language with your store currency, so French customers see `1 299,00 €` everywhere. The amounts charged were always correct, only the display differed.",
    },
    {
      title: "Our app was removed from Google Play",
      description:
        "We got an email from Google Play this morning that our app was removed for violating the User Data policy, because the 'privacy policy link is not accessible'. The app can't be found in the Play Store anymore. We didn't change anything in the app.\n\nExisting customers still have it, but new customers can't download it. What do we have to do?",
      priority: "urgent",
      labels: ["Question", "Android", "App review"],
      note: "Their privacy policy URL in Play Console points to `/pages/privacy`, which they renamed to `/pages/privacy-policy` last week, so it 404s. Once the URL is fixed we can appeal from the Policy status page. Hana is drafting the appeal text.",
      resolution:
        "Hi {name}, the removal happened because the privacy policy link in Play Console returned 'page not found' after the page was renamed on your store. We updated the link and submitted an appeal, and Google reinstated the app this afternoon. If you rename that page again, tell us first so we can update the listing.",
    },
    {
      title: "Product descriptions unreadable in dark mode",
      description:
        "In dark mode our product descriptions are black text on an almost black background, titles and prices are fine. Both iPhone and Android.",
      priority: "medium",
      labels: ["Bug"],
      note: "Descriptions are HTML from the product editor and include inline `color: #000000` when merchants paste from Word. The app's dark stylesheet doesn't override inline styles. Lena now strips inline colours in the mobile description sanitizer.",
      resolution:
        "Your descriptions have a black text colour saved in them, which comes along when text is pasted from Word or Google Docs, and the app kept that colour in dark mode. Since 5.11.4 the app ignores text colours in descriptions, so they follow light and dark mode like the rest of the page. Nothing to change on your side.",
    },
    {
      title: "Let customers share their wishlist",
      description:
        "Customers ask if they can send their wishlist to family, for birthdays for example. Could the app (and maybe the website) have a share button on the wishlist?",
      priority: "low",
      labels: ["Feature request"],
      note: "Wishlists are private per account. Sharing needs a public read-only link and a web page to render it. Five merchants have asked so far; logged, not planned.",
      resolution:
        "It's a nice idea and I've added it to our feature requests. It needs a public version of the wishlist on the web as well, so it isn't planned for this quarter; I'll let you know if that changes.",
    },
    {
      title: "VoiceOver reads prices and sale badges wrong",
      description:
        "An external agency did an accessibility audit of our app and found several VoiceOver problems. The worst ones:\n\n1. Prices are read as 'dollar sign, forty nine, point, ninety nine' instead of '49 dollars 99'\n2. The sale price and the old price are read together without saying which is which: '59.99 49.99'\n3. The heart icon for the wishlist is read only as 'button'\n\nTested on iPhone 15 with iOS 18. We would like this fixed before our next audit in two months.",
      priority: "medium",
      labels: ["Bug", "iOS"],
      note: "The price label is built from three separate `Text` views, so VoiceOver reads each piece. Olivia checked that one combined `accessibilityLabel` like 'Now 49.99 dollars, was 59.99 dollars' fixes 1 and 2, and the wishlist button is just missing a label. All in PR #5098.",
      resolution:
        "Hi {name}, all three are fixed in 5.12.0. VoiceOver now reads prices as one amount, says 'now' and 'was' for sale prices, and announces the wishlist button as 'Add to wishlist' or 'Remove from wishlist'. Thanks for sharing the audit, it helped us find similar issues on other screens too.",
    },
    {
      title: "TestFlight build not showing up for my colleagues",
      description:
        "You told us the new version is in TestFlight, but my colleagues don't see it in the TestFlight app, only I can. Did we do something wrong?",
      priority: "low",
      labels: ["Question", "iOS"],
      note: "The build was only added to the internal group. Her colleagues are external testers, which needs Beta App Review for each new version. Added the build to their external group and submitted it.",
      resolution:
        "You're in the internal testing group, so you saw the build right away; your colleagues are in the external group, where Apple checks each build first. We've submitted it for that check, which usually takes a few hours, and they'll get a TestFlight notification once it's approved.",
    },
    {
      title: "TalkBack doesn't read the size options",
      description:
        "A customer who is blind wrote to us that she cannot choose a size or colour in our Android app. TalkBack says 'unlabelled' for every option, so she has to ask someone to help her. Please fix this, it's not acceptable for us.",
      priority: "medium",
      labels: ["Bug", "Android"],
      note: "The option chips are custom views without `contentDescription` and aren't marked as selectable. Olivia repro'd with TalkBack on a Pixel 9. PR #5052 adds labels plus `stateDescription` for selected and sold out.",
      resolution:
        "Thanks {name}, and please thank your customer for telling you. In 5.11.4 TalkBack reads each size and colour option with its name and whether it's selected or sold out. We've also added a TalkBack pass on the product page to our release testing.",
    },
    {
      title: "Checkout button does nothing on iPhone",
      description:
        "On iOS the 'Go to checkout' button in the cart doesn't react. No error, no loading, nothing. Android works.\n\n1. Add any product to the cart\n2. Open the cart\n3. Tap 'Go to checkout'\n\nExpected: checkout opens\nActual: nothing happens. Sometimes after tapping 10+ times it opens.\n\niPhone 15 and 16, iOS 18.0, app 5.12.0. About 70% of our app revenue is from iPhone, and app orders are down 80% since noon.",
      priority: "urgent",
      labels: ["Bug", "iOS"],
      note: "Once the cart passes the free shipping threshold, the progress banner gets an invisible full-width tap area over the button, iOS only. Olivia repro'd with any cart above the free shipping amount. Switched the banner off for this store via remote config (`cart.free_shipping_banner`); proper fix in PR #5127.",
      resolution:
        "Hi {name}, checkout works again on iPhone. The free shipping progress banner in the cart was covering the button once the cart passed the free shipping amount, so we switched the banner off for your store. It comes back in 5.12.3 with the layout fixed, and customers may need to close and reopen the app once to get the change.",
    },
    {
      title: "How do you count 'app sessions' in the dashboard?",
      description:
        "Our dashboard says 48,000 app sessions last month but Firebase says 61,000, which one is right? How do you define a session?",
      priority: "low",
      labels: ["Question"],
      note: "Our dashboard counts foreground sessions with a 30 minute timeout, while Firebase also counts some background launches, like iOS waking the app to deliver a push. The gap is 15 to 30% for most merchants.",
      resolution:
        "Both are right, they count differently. Our dashboard counts a session when a customer actually has the app open on screen, and ends it after 30 minutes without activity. Firebase also counts some moments when the app wakes up in the background, for example to receive a push, so its number is usually 15 to 30% higher. For month-to-month comparisons, pick one and stick with it.",
    },
    {
      title: "Android back button closes the app from product page",
      description:
        "Steps to reproduce:\n1. Open the app\n2. Go to a category, e.g. Sale\n3. Open a product\n4. Press the Android back button or swipe back\n\nExpected: back to the category list\nActual: the app closes and you're on the phone's home screen\n\nThe back arrow at the top left works. Pixel 8 with Android 15, app 5.12.0. Customers lose their place in the list every time.",
      priority: "medium",
      labels: ["Bug", "Android"],
      note: "5.12.0 turned on predictive back (`enableOnBackInvokedCallback`), and the product screen only registers its callback when opened from search, not from a category. So the system handles back and finishes the activity. Olivia repro'd on a Pixel 8 and an S24; Sam is fixing it for 5.12.2.",
      resolution:
        "With the new Android back gesture, product pages opened from a category didn't tell Android how to go back, so it closed the app. 5.12.2 fixes it: back from a product page now returns to the list at the same scroll position.",
    },
    {
      title: "Arabic language and right-to-left layout",
      description:
        "We are launching our store in the UAE and Saudi Arabia in about two months, and the website will be in Arabic. Does the app support Arabic with right-to-left layout? If not, can it be added before our launch? This is a big market for us and the app is part of the launch plan.",
      priority: "high",
      labels: ["Feature request"],
      note: "Android gets partway with `supportsRtl`, but both platforms have hardcoded left/right paddings and icons that don't mirror. Olivia did a pseudo-RTL pass and found about 40 screens with issues; Sam says 5.14 at the earliest. Ravi flagged this as important for the account.",
      resolution:
        "Hi {name}, honestly, not in time for your launch: the app doesn't support right-to-left languages yet, and our first check found too many screens to fix in two months. It's planned and your launch moves it up the list, but realistically it lands in 5.14. Until then your mobile website supports Arabic fully, so we'd suggest pointing your UAE and Saudi campaigns there.",
      tier: "enterprise",
    },
    {
      title: "App shows old sale prices after the sale ended",
      description:
        "Our sale ended Sunday at midnight. On Monday some customers still saw sale prices in the app, added to cart, and then at checkout it was the normal price. We got angry emails and two comments on Instagram that we're doing bait and switch.\n\nWhat we saw:\n- Product page in the app: `39,00 €`\n- Checkout: `59,00 €`\n\nIt fixes itself when they pull down to refresh. Is the app keeping old prices? We never had this with the website.",
      priority: "medium",
      labels: ["Bug"],
      note: "The offline cache keeps product detail for 24h and revalidates in the background on slow networks, but the fresh result isn't applied to the screen that's already open. Lena is making price and stock always revalidate on open and update the view.",
      resolution:
        "Thanks {name}. The app was showing prices it had saved for offline use and didn't update the screen once the new price arrived. Since 5.11.3 prices and stock are refreshed every time a product is opened, and saved prices are cleared when a scheduled sale ends. Checkout always charged the correct price, so no one paid a wrong amount.",
    },
    {
      title: "Which iOS and Android versions does the app support?",
      description:
        "A customer with an older iPhone can't download our app. What are the minimum versions?",
      priority: "low",
      labels: ["Question"],
      note: "5.12 supports iOS 16+ and Android 8 (API 26)+. iOS 15 was dropped in 5.10. The customer's iPhone 7 can't go past iOS 15.8.",
      resolution:
        "The current app needs iOS 16 or newer on iPhone and Android 8 or newer. If your customer's iPhone can't update past iOS 15, like an iPhone 7, the App Store may offer the last compatible version of your app, but it won't get new features. Your mobile website works on those phones.",
    },
    {
      title: "Tapping a push opens the app but not the collection",
      description:
        "Our pushes link to a collection (`/collections/new-in`). When customers tap the notification the app opens, but on the home screen, not on the collection. It only happens when the app was fully closed. If the app was in the background it works.",
      priority: "medium",
      labels: ["Bug", "Push notifications"],
      note: "Cold start race: the push payload is read at launch, but the router isn't ready until the tab bar has loaded remote config, so the route gets dropped. Same on Android. Sam now queues the pending route until the router is ready.",
      resolution:
        "Fixed in 5.11.4. When the app was closed, it read the push link before it was ready to open screens, and the link got lost. Now it waits and opens the collection once the app has started.",
    },
    {
      title: "Customers logged out of the app every day",
      description:
        "Since the last update customers have to log in again every day. We have a lot of 1-star reviews like 'Why do I have to log in every single time?'. Before, it kept them logged in for months. Android and iPhone both.",
      priority: "high",
      labels: ["Bug", "Login"],
      note: "5.12.0 stores the refresh token under a new Keychain/Keystore key, but the refresh call still reads the old one, so the 24h access token expires with nothing to refresh it. Lena spotted `refresh_token missing` up 40x in the auth service logs after the release. Fix in 5.12.2.",
      resolution:
        "Thanks {name}, 5.12.2 fixes it. The update saved the login in a place the app didn't look later, so customers had to log in again when their daily session ran out. After updating they'll log in one last time and then stay logged in as before.",
    },
    {
      title: "Rejected under guideline 4.8 after adding Google login",
      description:
        "We turned on 'Continue with Google' in Mobile > Login and submitted a new version. Apple rejected it with 'Guideline 4.8 - Design - Login Services'. What does this mean? We don't want to remove Google login, a lot of our customers asked for it.",
      priority: "high",
      labels: ["Question", "App review", "Login"],
      note: "4.8 requires an equivalent privacy-focused login option whenever a third-party login is offered, so they need Sign in with Apple as well. That needs the capability on their App ID and a key under Mobile > Login > Apple. Hana sent the setup guide and Sam rebuilds once the key is in.",
      resolution:
        "Thanks {name}, approved and live. Apple requires Sign in with Apple, or a similar private login option, whenever an app offers Google login, so we added it next to Google. Both options are in 5.11.3, and customers who already use Google login aren't affected.",
    },
    {
      title: "Colour swatch shows the photo of another colour",
      description:
        "On the product page, when you tap the green swatch, the main image changes to the blue one. Only for some products, for example SKU 22871-GRN. On the website it shows the right image.\n\nIt's confusing customers: we had 3 returns this week from people who got a different colour than they expected.",
      priority: "medium",
      labels: ["Bug"],
      note: "The app matches variant images by position and the web by `variantId`. On products whose images were reordered after upload, the position is off by one. Hana confirmed on 22871; switching the app to `variantId` matching.",
      resolution:
        "Hi {name}, fixed in 5.11.3. The app picked the variant photo by its position in the image list instead of by the variant it belongs to, so products with reordered images showed the wrong one. You don't need to change anything on your products.",
    },
    {
      title: "Show loyalty points in the app",
      description:
        "We use Brightcart Loyalty on the website. Customers see their points in their account on the web but not in the app. Can you add the points balance, and redeeming points at checkout, to the app? Customers keep asking us where their points are.",
      priority: "medium",
      labels: ["Feature request"],
      note: "The loyalty API exists, the app just has no screens for it. The balance in the account screen is small; redemption in native checkout is bigger because of the discount line handling. Sam: balance in 5.13, redemption later.",
      resolution:
        "This is coming in two steps: the points balance on the account screen is planned for 5.13, and using points at checkout follows later, probably early next year. I've added you to the list of merchants we contact for the beta.",
    },
    {
      title: "Red badge on app icon never goes away",
      description:
        "The red number on our app icon stays at 3 even after opening the app and reading the notifications (iPhone). Small thing, but customers ask about it.",
      priority: "low",
      labels: ["Bug", "iOS", "Push notifications"],
      note: "The badge comes from `aps.badge` in the push payload and we never reset it on app open. Setting the badge count to 0 in `sceneDidBecomeActive` fixes it, small change for 5.12.0.",
      resolution:
        "Fixed in 5.12.0: the badge on the app icon now clears as soon as the customer opens the app.",
    },
    {
      title: "What should we answer in the Play Data safety form?",
      description:
        "Google Play wants us to update the Data safety section before our next release. There are a lot of questions about what data the app collects and shares, and we don't know the technical details. Do you have the answers somewhere?",
      priority: "low",
      labels: ["Question", "Android", "App review"],
      note: "The help center has the answers per app version. The only store-specific part is whether Klaviyo or Meta Pixel is enabled. Checked: this store has Klaviyo on, so 'Device or other IDs' is shared.",
      resolution:
        "Hi {name}, we keep the answers for each app version in our help center article 'Google Play Data safety answers'. Use the 5.12 table, and because you've turned on the Klaviyo integration, also mark 'Device or other IDs' as shared, as the article explains. Send us a screenshot of the summary before you submit if you'd like us to double-check.",
    },
    {
      title: "Logo on splash screen looks stretched on Pixel",
      description:
        "On a Pixel 7 Pro the logo on the splash screen is stretched wide, on iPhone it looks normal. Screenshot attached.",
      priority: "low",
      labels: ["Bug", "Android"],
      note: "The Android 12+ splash screen API masks the icon into a circle and scales it to fit, and their logo is a wide wordmark. Without a square splash icon uploaded, the build falls back to the wordmark.",
      resolution:
        "Android shows the splash logo inside a circle, so wide logos get squeezed. If you upload a square version of your logo under Mobile > Branding > Android splash icon, we'll include it in the next build and it will look right. On iPhone the wide logo is fine as it is.",
    },
    {
      title: "App gets slower and crashes after browsing a while",
      description:
        "Customers report that after browsing for 10-15 minutes the app becomes slow, images take long to load, and then it closes by itself. We tested it ourselves:\n\n1. Open a big category (we have 800+ products in one)\n2. Scroll for a few minutes, open products, go back, repeat\n3. After about 60 products the scrolling is jerky\n4. After around 100 the app closes\n\nGalaxy A54 with Android 14. iPhone seems okay. Play Console shows `OutOfMemoryError` as our top crash.",
      priority: "medium",
      labels: ["Bug", "Android", "Crash"],
      note: "Product images are decoded at full resolution (up to 4000px) and the back stack keeps every product fragment's bitmaps. Mid-range phones hit the heap limit fast; Olivia repro'd on the A54 at about 90 products. Downsampling to view size and releasing images in `onStop`.",
      resolution:
        "Thanks {name}, 5.11.3 fixes this. The app loaded product photos at full size and kept all of them in memory while browsing, which mid-range phones like the A54 run out of. Photos are now loaded at screen size and released when a product page closes, and we scrolled through 400 products on an A54 without a slowdown.",
    },
    {
      title: "Can we force customers to update the app?",
      description:
        "About 20% of our app customers are still on version 5.9 or 5.10. They miss the new features, and some bugs we still get complaints about were fixed long ago. Can we make them update?",
      priority: "medium",
      labels: ["Question"],
      note: "Mobile > Releases has `recommended_version` (dismissible prompt) and `min_supported_version` (blocking 'Update required' screen) per platform. Versions older than 5.8 don't read them, but that's under 1% for this store.",
      resolution:
        "Thanks {name}, yes. Under Mobile > Releases you can set a recommended version, which shows customers on older versions an update prompt they can dismiss, and a minimum version, which blocks the app until they update. We suggest starting with the recommended version for a couple of weeks, since a hard block can frustrate customers on slow connections.",
    },
    {
      title: "Seasonal app icon for the holidays",
      description:
        "Could we change the app icon for the holiday season, like some big apps do? Just our normal icon with a bit of snow on it, for a few weeks.",
      priority: "low",
      labels: ["Feature request", "iOS"],
      note: "iOS alternate icons need the user to confirm (`setAlternateIconName` shows a system alert), so we can't switch silently, and Android's activity-alias trick is flaky. Only real option is changing the main icon in a build. Not planned.",
      resolution:
        "Hi {name}, apps can't change their own icon quietly: iPhone asks the customer for permission each time, and on Android it's unreliable. What works is changing the main icon in an update and changing it back in a later one. If you send us the icon at least three weeks ahead, we'll include it in the release before the holidays.",
    },
    {
      title: "Barcode scanner crashes the app on iOS 18",
      description:
        "The scan button in search (to scan a product barcode in the store) crashes the app on iPhones with iOS 18. With iOS 17 it works. Not many customers use it, but our store staff do all day.",
      priority: "medium",
      labels: ["Bug", "iOS", "Crash"],
      note: "`NSInternalInconsistencyException`: we add the `AVCaptureMetadataOutput` before the capture session is configured, and iOS 18 is stricter about `beginConfiguration`. Olivia repro'd on an iPhone 13 with iOS 18.0.",
      resolution:
        "5.11.4 fixes the scanner crash. iOS 18 is stricter about the order in which the camera is set up, and the scanner did one step too early. It works on both iOS 17 and 18 now.",
    },
    {
      title: "App shows prices without VAT, website with VAT",
      description:
        "Our website shows prices including VAT (we sell to consumers in Germany, it's required). In the app, the category list shows prices without VAT and the product page with VAT. Example:\n\n- Category list in the app: `41,18 €`\n- Product page in the app: `49,00 €`\n- Website: `49,00 €`\n\nThis is a legal problem for us, prices shown to consumers must include VAT. Please treat this as important.",
      priority: "high",
      labels: ["Bug"],
      note: "The category list uses the search index price, which stores net prices for stores set to 'prices entered excluding tax'. This store switched to gross prices last month and the mobile search index was never reindexed. Reindexed their catalog; Lena is adding a reindex trigger on that tax setting.",
      resolution:
        "Thanks {name}, the category list now shows prices including VAT, same as the product page and the website. When you switched to entering prices with VAT, the product list in the app kept using a copy of the old net prices; we've refreshed it and made sure changing that setting always updates the app too. No app update needed.",
    },
    {
      title: "Can we remove the app from iPad?",
      description:
        "We only designed our content for phones. Is it possible that the app is not available on iPad?",
      priority: "low",
      labels: ["Question", "iOS"],
      note: "Once an app has shipped with iPad support, Apple doesn't allow dropping the device family in an update. Suggested they look at it on an iPad first, the tablet layout has been decent since 5.11.",
      resolution:
        "Unfortunately Apple doesn't allow an app to drop iPad support once it has been released with it. The good news is that since 5.11 the app uses a proper tablet layout on iPad, with a larger product grid and a side menu. Have a look on an iPad and tell us if a screen looks off, we're happy to fix specific ones.",
    },
    {
      title: "'Rate our app' popup shows after every order",
      description:
        "Customers see the 'Enjoying the app? Rate us' popup after every single order on Android. One wrote that it's annoying and gave us 2 stars because of it. Can it show less often?",
      priority: "low",
      labels: ["Bug", "Android"],
      note: "Android uses our own dialog instead of the Play In-App Review API, and the 'don't ask again for 90 days' flag is reset on every order. iOS uses `SKStoreReviewController`, which Apple rate-limits anyway. Lena is switching Android to the Play API.",
      resolution:
        "On Android the app was showing its own rating popup after every order. 5.12.0 uses Google's official review prompt instead, which Google shows at most a few times a year per customer. On iPhone, Apple already limits it to three times a year.",
    },
    {
      title: "Push notification when a product is back in stock",
      description:
        "On our website customers can click 'Notify me when back in stock' and get an email. In the app this button doesn't exist. We would love a push notification instead of an email, it would sell a lot.",
      priority: "medium",
      labels: ["Feature request", "Push notifications"],
      note: "Back in stock alerts are email-only in the notifications service. Adding a push channel is mostly backend, since the device to customer link already exists, plus a 'Notify me' button in the app. Lena thinks it's a small project; not scheduled.",
      resolution:
        "Thanks {name}, I've logged it with your use case. Back in stock alerts by push aren't scheduled yet, but several merchants have asked, so they're high on the list for next quarter's planning. We'll let you know when there's news.",
    },
    {
      title: "Home banner text cut off on iPhone 16 Pro Max",
      description:
        "The text on our home screen banner is cut off on the left and right on iPhone 16 Pro Max. On smaller iPhones it's fine.",
      priority: "low",
      labels: ["Bug", "iOS"],
      note: "Home banners use `aspectFill` in a fixed 16:9 box, which crops on the Pro Max width, and merchants put text inside the image. Lena changed banners to fit the width with a dynamic height.",
      resolution:
        "On larger iPhones the banner was cropped to keep a fixed height. From 5.12.0 it scales to the full width and keeps the whole image. Until your customers update, keeping text away from the outer 10% on each side avoids the cut.",
    },
    {
      title: "How do we make Instagram ads open the app?",
      description:
        "We run Instagram and Facebook ads for single products. When people have our app installed, we want the ad to open the product in the app, not the website. Our agency asks for a 'deep link URL' in Meta Ads Manager. What do we put there?",
      priority: "medium",
      labels: ["Question"],
      note: "The https product URL works as a universal link in most places, but Meta's in-app browser doesn't reliably hand off to the app. For app-installed audiences use the custom scheme in the deep link field, with the https URL as the website. The scheme is shown under Mobile > Links.",
      resolution:
        "Hi {name}, in Ads Manager put the product's normal web address in the website URL field, and in the deep link field use your app link from Mobile > Links (it looks like `yourapp://products/<handle>`). Customers with the app go straight to the product, everyone else lands on the website. Instagram's own browser sometimes ignores normal links to the app, which is why the deep link field matters.",
    },
    {
      title: "Location popup says 'Brightcart' instead of our name",
      description:
        "When customers open 'Find a store', the iPhone asks for location. The title has our app name, but the text below says: 'Brightcart uses your location to show nearby stores.'\n\nOur app is not called Brightcart! Customers ask us who Brightcart is. Please change it to our brand.",
      priority: "medium",
      labels: ["Bug", "iOS"],
      note: "`NSLocationWhenInUseUsageDescription` in the template Info.plist is hardcoded instead of built from `app_display_name`, and so is the camera string for the barcode scanner. Olivia found three more strings like that. Sam templated all of them.",
      resolution:
        "Thanks {name}, fixed in 5.12.0. The text under the location and camera permission popups used our name instead of your app name. All permission texts now use your brand, and you can adjust the wording under Mobile > Texts if you like.",
    },
    {
      title: "Add to cart broken on Android!!",
      description:
        "Add to cart shows 'Something went wrong, try again' on all our Android phones since this morning. Nobody can buy in the Android app!",
      priority: "urgent",
      labels: ["Bug", "Android"],
      note: "Cart API returns 400 `unknown field: bundleItems`: Android 5.12.0 sends the new bundle field, but the cart service in eu-west was still on the old version because its deploy had been paused. Finished the deploy at 10:40 and the errors stopped. Lena is adding a contract test so client and API can't drift like this.",
      resolution:
        "Hi {name}, adding to cart works again on Android. The Android app was sending a piece of information our European servers didn't know about yet, because they were updated later than the rest. Customers don't need to do anything, and carts from before this morning are still there.",
    },
    {
      title: "Can your team reply to our App Store reviews?",
      description:
        "We get a lot of reviews that are really about the app, not our products: crashes, login, that kind of thing. Can your team answer them for us? We don't know what to say technically.",
      priority: "low",
      labels: ["Question", "App review"],
      note: "We don't reply on merchants' behalf since reviews appear under their brand. Hana has template replies for the common technical topics; sent those.",
      resolution:
        "We don't reply to reviews on your behalf, since they appear under your brand, but we can help with what to say. I've sent you templates for the most common technical topics: login problems, crashes after an update and missing notifications. If a review mentions a bug you haven't seen reported, forward it to us and we'll look into it.",
    },
    {
      title: "Login code isn't suggested above the keyboard",
      description:
        "When customers log in with the 6-digit code from our login email, the iPhone doesn't suggest the code above the keyboard like other apps do. They have to switch to Mail and copy it. iOS 17 and 18.",
      priority: "low",
      labels: ["Bug", "iOS", "Login"],
      note: "The code field is six separate text fields for the boxed look, none with `textContentType = .oneTimeCode`, so iOS doesn't offer the code. Lena is reworking it as one hidden field behind the boxes.",
      resolution:
        "Fixed in 5.12.0: iPhones now suggest the login code from Mail above the keyboard. The code boxes weren't marked as a one-time code field, so iOS didn't know to offer it.",
    },
    {
      title: "Recently viewed products on the home screen",
      description:
        "Could the home screen show a row with the products the customer looked at recently? Our web theme has it and it gets a lot of clicks.",
      priority: "low",
      labels: ["Feature request"],
      note: "The data is already on the device (offline mode keeps recently viewed). Needs a new home block type in the CMS; Lena estimates about a week. Added to the home blocks backlog.",
      resolution:
        "Good idea, and the app already keeps track of recently viewed products, so it's mostly a new home screen block. It's on our list for the home screen update planned for next quarter, and I'll tell you when it shows up in the editor.",
    },
    {
      title: "'Add to cart' button disappears with large text size",
      description:
        "One of our customers uses the largest text size on her iPhone (Settings > Accessibility > Larger Text). In our app the 'Add to cart' button on the product page is pushed off the screen and she can't scroll to it, so she can't buy anything. iPhone 13 mini, iOS 17.",
      priority: "medium",
      labels: ["Bug", "iOS"],
      note: "The product page's bottom bar has a fixed height, so at the AX5 text size the button label wraps and gets clipped, and the scroll view's bottom inset ignores the bar. Olivia repro'd at the largest accessibility size on an iPhone 13 mini. Sam's fix is PR #5033.",
      resolution:
        "Thanks {name}, fixed in 5.11.4. At the largest text sizes the button bar didn't grow with the text, so the button was cut off. It now expands and the page scrolls far enough to reach it, from the default size up to the largest accessibility size.",
    },
    {
      title: "We're rebranding: how do we update the app name and icon?",
      description:
        "We are rebranding in six weeks, new name and logo. What do we need to do so that the app in the App Store and Google Play shows the new name and icon on the same day? Existing customers should keep the app, not have to download a new one.",
      priority: "medium",
      labels: ["Question", "App review"],
      note: "New name and icon mean a new build plus store metadata; the bundle ID stays, so customers keep the app. Plan: submit a week before with manual release on iOS and managed publishing on Play. Sam will coordinate the timing with them.",
      resolution:
        "Hi {name}, customers keep the same app, only the name and icon change. Send us the new icon (1024x1024 PNG) and the new name at least two weeks before; we'll build the update and submit it on hold, so you can release it in App Store Connect and Google Play on the day. The store listing text and screenshots you update yourselves, and we'll send you a checklist for both stores.",
    },
    {
      title: "'Only 2 left' shows in English in the Spanish app",
      description:
        "Our app is in Spanish, but the low stock message on products says 'Only 2 left'. Everything else is Spanish.",
      priority: "low",
      labels: ["Bug"],
      note: "`product.low_stock` was added in 5.11.0 after the last translation export, so es, fr, it and de fall back to English. Hana found four other strings with the same problem.",
      resolution:
        "That message was added after our last translation round, so it fell back to English. The Spanish text and a few other new messages are included in 5.11.2, which you can publish from Mobile > Releases.",
    },
    {
      title: "Different home page for the app than the website",
      description:
        "Right now the app home screen shows the same content blocks as our website home page. We want to show app-only content, for example an 'app exclusive 10% off' banner that doesn't appear on the website. Is this possible?",
      priority: "medium",
      labels: ["Feature request"],
      note: "Home blocks have no channel targeting yet; it's part of the CMS work Lena has planned. Discount codes can already be limited to the `mobile_app` sales channel, which is a decent workaround.",
      resolution:
        "Not possible yet: the app home screen uses the same blocks as your website home page. A 'show on web / app' setting per block is planned for next quarter and I've added your vote. Until then, you can create a discount code limited to the mobile app sales channel and announce it with a push instead of a banner.",
    },
    {
      title: "What customer data does the app store on the phone?",
      description:
        "Our data protection officer is updating our privacy policy and asks what personal data the app keeps on the device and for how long. Also if anything is sent to third parties directly from the app. Could you send us a list?",
      priority: "medium",
      labels: ["Question"],
      note: "The mobile data inventory is an annex to the DPA. On device: auth tokens in Keychain/Keystore, cart, recently viewed, wishlist cache, push token, analytics install ID. Third parties: Firebase always, Klaviyo and Meta only if enabled.",
      resolution:
        "Thanks {name}, I've sent your DPO our mobile data inventory. In short, the phone keeps the login token (in the system's secure storage), the cart, recently viewed products, the wishlist and the push notification token, until the customer logs out or deletes the app. From the app itself, data goes to Firebase for crash reports and analytics, and to Klaviyo or Meta only if you've enabled those integrations.",
    },
    {
      title: "German tab labels cut off",
      description:
        "In the German app the bottom bar says 'Wunschzet...' and 'Kategor...', looks unprofessional. English is fine.",
      priority: "low",
      labels: ["Bug"],
      note: "Tab labels are single line with truncation on iOS. Lena added tab label overrides under Mobile > Texts and a small font scale-down before truncating. Olivia checked German on an iPhone SE, the narrowest screen we support.",
      resolution:
        "German words are long for the bottom bar, so you can now set shorter tab names under Mobile > Texts, for example 'Merkliste' instead of 'Wunschzettel'. The app also shrinks the text slightly before cutting it off.",
    },
    {
      title: "Why did our push opt-in rate drop after 5.12?",
      description:
        "Since 5.12.0 our push opt-in rate for new users dropped from 61% to 38% on iPhone. Did something change in how the app asks?",
      priority: "medium",
      labels: ["Question", "Push notifications"],
      note: "Yes: 5.12.0 moved the iOS prompt from first launch to after the first order. Fewer new users reach an order, so fewer see it, but 74% of those who see it accept. They can switch back with 'When to ask for push permission' under Mobile > Push.",
      resolution:
        "Hi {name}, yes. Since 5.12.0 the app asks for notification permission after the first order instead of at first launch, because customers who have just ordered are much more likely to say yes: 74% of your customers who see the prompt now accept. Fewer new users see it at all, which is why the overall rate dropped. If you'd rather ask at first launch again, change 'When to ask for push permission' under Mobile > Push.",
    },
    {
      title: "Product photos blurry on iPad",
      description:
        "On iPad Pro our product photos look blurry, while on iPhone they are sharp. We upload 2000px images.",
      priority: "low",
      labels: ["Bug", "iOS"],
      note: "The image loader asks the CDN for twice the view width in points, capped at 1024px, and a full-width image on a 13 inch iPad Pro needs about 2064px. The cap is remote config, so raised it to 2048 for tablets, no build needed.",
      resolution:
        "Fixed with a setting on our side, no update needed. The app asked for images at most 1024 pixels wide, which is enough for phones but not for a large iPad screen. iPads now get up to 2048 pixels, so photos look sharp the next time the app is opened.",
    },
    {
      title: "Abandoned cart push notifications",
      description:
        "We send abandoned cart emails with Klaviyo and they work well. But for app users who are not logged in we have no email address. Could the app send a push like 'You left something in your cart' after a few hours?",
      priority: "medium",
      labels: ["Feature request", "Push notifications"],
      note: "The abandoned cart push flow is in beta behind `push_flow_abandoned_cart`, with six merchants on it. Anonymous carts are tied to the device, so it works without login. Enabled it for this store and Hana will walk them through the setup.",
      resolution:
        "Hi {name}, good timing: this exists in beta. We've switched it on for your store, and you'll find it under Mobile > Push > Automations, where you choose the delay and the text. It works for customers who aren't logged in too, as long as they allowed notifications.",
    },
    {
      title: "Can we get an APK for our shop staff?",
      description:
        "Our store staff have Android tablets without a Google account. Can we install the app with an APK file?",
      priority: "low",
      labels: ["Question", "Android"],
      note: "We only ship app bundles through Play. For devices without Play, the merchant can download a universal APK from Play Console > App bundle explorer themselves.",
      resolution:
        "Thanks {name}, you can download one yourselves: in Google Play Console go to App bundle explorer, pick the latest release and download the signed universal APK. It installs on devices without a Google account, but it won't update automatically, so repeat this after each release.",
    },
    {
      title: "App orders missing from customers' order history",
      description:
        "Customers who order in the app don't see the order under Account > Orders. Orders from the website show there, the app ones don't. They do get the confirmation email, so the order exists.\n\nWhat we checked:\n1. Order 418273 was placed in the app by a logged-in customer and shows in our admin with her email\n2. In the admin the order has no customer account linked, it says 'Guest'\n3. Same customer, order from the website: linked to her account\n\nWe get calls every day from customers who think their app order didn't go through. Some ordered twice.",
      priority: "high",
      labels: ["Bug"],
      note: "When the access token refreshes mid-checkout, the app sends the order without the session and it's created as a guest order with only the email. The web links guest orders to the account at login, the app doesn't. Lena added the same linking to the orders endpoint and wrote a backfill.",
      resolution:
        "Hi {name}, fixed. If a customer's login session renewed during checkout, the app placed the order as a guest, so it didn't show in their account. New orders are linked correctly, and we've linked the 312 app orders from the last month to the right accounts, including 418273.",
    },
    {
      title: "Save cards in the app for faster checkout",
      description:
        "Returning customers have to type their card number every time they order in the app. On the website Stripe remembers the card. Could the app do the same? Apple Pay helps on iPhone, but many of our Android customers don't use Google Pay.",
      priority: "medium",
      labels: ["Feature request"],
      note: "The web attaches the Stripe PaymentMethod to the customer; the app's native card form doesn't. Stripe's mobile PaymentSheet supports saved cards with a customer ephemeral key. Sam has it on the 5.13 list.",
      resolution:
        "Thanks {name}, saved cards are planned: we're moving the app to a card form that remembers cards for logged-in customers, like your website does. It's scheduled for 5.13, and cards your customers saved on the website will show up in the app too.",
    },
    {
      title: "Who writes the 'What's new' text for updates?",
      description:
        "Every update in the App Store says 'Bug fixes and performance improvements'. Can we write our own text, to announce new features sometimes?",
      priority: "low",
      labels: ["Question", "App review"],
      note: "Release notes are pre-filled from the release template, and merchants can edit them per release before approving. Most don't know the button exists.",
      resolution:
        "You can. When a new version is ready under Mobile > Releases, click 'Edit release notes' before approving it, and your text goes to both the App Store and Google Play, in each language your app supports. If you leave it empty we use the default text.",
    },
    {
      title: "Push images don't show on iPhone",
      description:
        "We add an image to our pushes in the composer. On Android the image shows in the notification, on iPhone only the text. Is it something we do wrong? iPhone 15, iOS 18.",
      priority: "medium",
      labels: ["Bug", "iOS", "Push notifications"],
      note: "Rich push on iOS needs the Notification Service Extension, which needs its own App ID and profile in the merchant's developer account. When they moved to their own account that ID was never created, so our build skipped the extension silently. Created it through the App Store Connect API; the next build includes it.",
      resolution:
        "Thanks {name}, nothing wrong on your side. On iPhone, images in notifications need an extra component in the app, and it was left out of your builds when the app moved to your own Apple account. We've set it up, and the next update, which we submitted today, shows images on iPhone too.",
    },
    {
      title: "Where can I see which app versions customers use?",
      description:
        "Is there a place in the admin where I can see how many customers are on each version of the app?",
      priority: "low",
      labels: ["Question"],
      note: "Mobile > Health has an active versions chart per platform (active devices, last 30 days). Came up twice this week, so Hana is adding it to the help center FAQ.",
      resolution:
        "Go to Mobile > Health and scroll to 'Active versions': it shows the share of active devices on each app version for iOS and Android over the last 30 days. It's also the best place to decide when to set a minimum version.",
    },
  ],
  threads: [
    {
      title: "Android app crashing on launch since 5.12.0",
      description:
        "Since the 5.12.0 update went out on Google Play yesterday evening, a lot of our Android customers can't open the app. It shows the splash screen and closes. This is our biggest sale weekend of the year and it started this morning.\n\nWhat we know so far:\n- Play Console shows 1,900 crashes in the last 12 hours, almost all on Android 15\n- Pixel and Samsung both, for example Pixel 8 and Galaxy S24\n- iPhone is fine\n- Our rating went from 4.6 to 4.4 overnight\n\nWe need this fixed today.\n\nAnna",
      priority: "urgent",
      labels: ["Bug", "Android", "Crash"],
      status: "in_progress",
      assigneeId: "maya-chen",
      organizationId: "northgate-outfitters",
      quietForHours: 3,
      messages: [
        {
          kind: "public_reply",
          afterMinutes: 9,
          body: "Hi Anna, thanks for the details, we're on it. I can see the spike in your Play Console vitals too: it's limited to Android 15 and to 5.12.0. Sam, our mobile lead, and Olivia from QA are looking at it now. I'll update you here within the hour, sooner if we find something.",
          statusChange: "in_progress",
        },
        {
          kind: "internal_note",
          afterMinutes: 6,
          body: "Vitals for their Android app: user-perceived crash rate 8.1% on Android 15, 0.2% on 14 and below. All crashes are 5.12.0 and the top cluster is in `Application.onCreate`. Paged Sam. Ravi (their account manager) pinged me too; he wants an update every few hours through the weekend.",
        },
        {
          kind: "internal_note",
          authorId: "olivia-brooks",
          afterMinutes: 38,
          body: "Repro'd on a Pixel 8 with Android 15 on the latest security patch, but not on every cold start, roughly 1 in 4. Pixel 7 on Android 14 never crashes. From logcat:\n\n```\njava.lang.RuntimeException: Using WebView from more than one process at once with the same data directory is not supported. https://crbug.com/558377\n  at org.chromium.android_webview.AwDataDirLock.lock(AwDataDirLock.java:158)\n  at com.brightcart.shell.home.HomeWebViewPrewarmer.prewarm(HomeWebViewPrewarmer.kt:41)\n  at com.brightcart.shell.ShellApplication.onCreate(ShellApplication.kt:88)\n```\n\nNo idea yet why only some starts.",
        },
        {
          kind: "customer_message",
          afterMinutes: 22,
          body: "Update from our side: now 3,400 crashes and the rating is 4.3. We sent our 'Weekend sale is live' push to all app users an hour ago and the crashes jumped right after that. Our customer service got 30 messages in 20 minutes. The app is about 40% of our weekend revenue. Is there anything we can do right now?",
        },
        {
          kind: "public_reply",
          afterMinutes: 12,
          body: "Thanks Anna, the push detail is really useful. Olivia reproduced the crash on a Pixel 8 with Android 15, and it only happens on some starts, which fits with something arriving at the same moment the app opens. Sam is following that lead now. As a precaution, please don't send any more pushes to Android until we know more.",
        },
        {
          kind: "internal_note",
          authorId: "sam-okafor",
          afterMinutes: 48,
          body: 'Found it. 5.12.0 prewarms the home screen WebView in `Application.onCreate`, which runs in every process, including `:messaging`, the one FCM starts to deliver a push. If a push lands while the app is launching, both processes open a WebView on the same data directory. Older WebView builds only logged a warning; the WebView that ships with the latest Android 15 patch enforces the lock and kills the main process. That\'s the jump after their push.\n\nFix: prewarm only in the main process and call `WebView.setDataDirectorySuffix("messaging")` in the other one. Building 5.12.1 now.',
        },
        {
          kind: "public_reply",
          afterMinutes: 10,
          body: "Anna, we found the cause. The update prepares part of the home screen in the background when the app starts. On Android 15, if a push notification arrives while the app is opening, that preparation runs twice at the same time and Android stops the app. That's why the crashes jumped after your push.\n\nWhat we're doing:\n1. Sam is building 5.12.1 with the fix. We'll submit it to Google Play today, as soon as Olivia has tested it.\n2. Until then, please pause all Android pushes, including scheduled ones. Customers who open the app without a push arriving are mostly fine.\n\niPhone customers are not affected.",
        },
        {
          kind: "customer_message",
          afterMinutes: 25,
          body: "Paused. But we have the 'Last day, extra 10% off' push planned for tomorrow at 9:00, it's the biggest push of the weekend. We need to know if we can send it. And what should our customer service tell customers who write in? They are asking if they should delete the app.",
        },
        {
          kind: "public_reply",
          afterMinutes: 14,
          body: "Understood. We'll give you a clear go or no-go for tomorrow's push by 8:00. For customer service, something like this should work:\n\n> Sorry about that! A fix is on its way to Google Play today. Until then, if the app closes when you open it, please open it again from your home screen, it usually works on the second try. There's no need to delete the app, your cart and account are safe.\n\nPlease ask them not to suggest deleting the app: it doesn't help, and customers lose their login.",
        },
        {
          kind: "internal_note",
          authorId: "sam-okafor",
          afterMinutes: 150,
          body: "5.12.1 (51201) submitted to Play with the process check and the data directory suffix. Olivia did 60 cold starts on the Pixel 8 while firing test pushes every few seconds: zero crashes, against 14 out of 60 on 5.12.0. Staged rollout set to 20% so we can watch vitals before going wide.",
        },
        {
          kind: "public_reply",
          afterMinutes: 185,
          body: "Update: Google approved 5.12.1 and it's rolling out on Google Play now, starting with 20% of your Android customers. We start small so we can check the crash rate of the new version overnight. If it looks clean, we'll go to 100% first thing tomorrow, before your push.",
        },
        {
          kind: "customer_message",
          afterMinutes: 790,
          body: "Good morning. Crashes are lower but still 1,200 overnight and more 1-star reviews, we're at 4.2 now. Why only 20%?? Customers on the old version keep crashing. Please release it to everyone now. And what about the 9:00 push?\n\nAnna",
        },
        {
          kind: "internal_note",
          authorId: "sam-okafor",
          afterMinutes: 20,
          body: "Overnight vitals for 5.12.1: 0.2% user-perceived crash rate on Android 15, same as the 5.11.x baseline, and nothing in the WebView cluster. Every remaining crash is on 5.12.0. Moved the rollout to 100%.",
        },
        {
          kind: "public_reply",
          afterMinutes: 10,
          body: "Good morning Anna. 5.12.1 is now at 100%: overnight the new version had the same crash rate as before the update, and not a single crash of this kind. The crashes you still see come from customers who haven't received 5.12.1 yet. Most Android phones update apps automatically within a day or two, usually while charging on Wi-Fi.\n\nFor the 9:00 push: it's safe to send to customers on 5.12.1. In the push composer, under Audience, add the filter **App version** is at least **5.12.1**. Customers still on 5.12.0 won't get it, so it can't cause new crashes, and you can send them a second push later today once more of them have updated.",
        },
        {
          kind: "customer_message",
          afterMinutes: 120,
          body: "Sent to 5.12.1 only, looks fine so far, thank you. But 5.12.0 is still about half of our Android users. Can you force them to update? And our rating is 4.2 now, can Google remove the 1-star reviews about the crash?",
        },
        {
          kind: "internal_note",
          authorId: "sam-okafor",
          afterMinutes: 35,
          body: "Set `min_supported_version` for their Android app to 5.12.1 in remote config. 5.12.0 reads it on start (the crash only hits when a push lands during launch, so most starts get that far) and shows the blocking update screen, which opens the Play in-app update flow. Olivia checked it on the Pixel 8 with 5.12.0 installed.",
        },
        {
          kind: "public_reply",
          afterMinutes: 15,
          body: "Done: customers who open 5.12.0 now see an 'Update required' screen that updates the app from Google Play in one tap. That should move most of the remaining customers today.\n\nAbout the reviews: Google doesn't remove reviews about real problems, even once they're fixed. What does help is replying, because people who get a reply often update their rating. For example:\n\n> Thanks for letting us know, and sorry for the trouble this weekend. Version 5.12.1 fixes the crash on Android 15, please update from Google Play. We'd love to hear what you think once it works again.\n\nYou can reply from Play Console under Ratings and reviews.",
        },
        {
          kind: "customer_message",
          afterMinutes: 610,
          body: "Thanks. We replied to about 80 reviews and a few customers already changed to 4 or 5 stars. 140 crashes today until now. The sale is over, app revenue was lower than last year but not a disaster. Please keep watching, our Monday newsletter with app links goes out at 7:00.",
        },
        {
          kind: "public_reply",
          afterMinutes: 30,
          body: "Thank you Anna, and thanks to your team for moving so fast this weekend. We'll keep this open and watch the numbers overnight. I'll post an update here before your newsletter goes out.",
        },
        {
          kind: "internal_note",
          afterMinutes: 540,
          body: "Monday check: Android 15 crash-free users back at 99.6% (99.7% on the 7 days before the release). 5.12.0 is down to 11% of their active Android devices, so the update screen is doing its job. 38 crashes overnight, all on 5.12.0. Ravi is updated and will send their management a short summary.",
        },
        {
          kind: "public_reply",
          afterMinutes: 20,
          body: "Good morning Anna, here's the update before your newsletter. Yesterday 5.12.0 was on half of your Android devices, this morning it's 11%, and anyone who opens it is asked to update. The crash rate on Android 15 is back to normal: 38 crashes overnight, all on the old version. The newsletter is safe to send.\n\nWe'll keep monitoring until the old version is under 2%, and I'll send you a full write-up of what happened by Wednesday.",
        },
        {
          kind: "customer_message",
          afterMinutes: 420,
          body: "Newsletter went out at 7, no problems so far. Our CEO asks what you will change so this doesn't happen again during our next sale. Please include that in the write-up.\n\nAnna",
        },
      ],
    },
    {
      title: "App Store rejected our update, launch is next week",
      description:
        "Hello, Apple rejected our app update yesterday and we don't understand why. This is the message in App Store Connect:\n\n> Guideline 5.1.1(v) - Data Collection and Storage\n>\n> The app supports account creation but does not include an option to initiate account deletion. Apps that support account creation must also offer account deletion to give users more control of the data they've shared while using an app.\n\nOur app has been in the App Store for two years with the same login and it was never a problem. We launch our new skincare line next Thursday, and the update has the new shade finder that the whole campaign is built around. Can we still make it? What do we need to do?\n\nThank you,\nIsabella",
      priority: "medium",
      labels: ["Question", "iOS", "App review"],
      status: "resolved",
      assigneeId: "sam-okafor",
      organizationId: "solstice-beauty",
      quietForHours: 20,
      messages: [
        {
          kind: "internal_note",
          afterMinutes: 35,
          body: "Their mobile config has `account.deletion_mode = email_link`, the legacy option that opens a `mailto:` to their customer care. Apple stopped accepting that. `in_app_request` (creates a request in the admin, the merchant completes it) and `in_app_immediate` both pass review, as long as deletion starts in the app and we revoke the Sign in with Apple token. Launch is next Thursday, so we have about a week for a build and a review.",
          statusChange: "in_progress",
        },
        {
          kind: "public_reply",
          afterMinutes: 15,
          body: "Hi Isabella, I'm Sam, I lead the mobile team and I'll handle this with you. This is fixable in time, don't worry.\n\nApple requires every app where customers can create an account to also let them delete it from inside the app. Your app has a 'Delete my account' link under Account > Privacy, but it opens an email to your customer care, and Apple no longer accepts that as deletion. It wasn't flagged before because reviewers don't check every rule on every update.\n\nThe app already has a proper in-app deletion flow, it's just not switched on for your store. Before I enable it I need one decision from you: should a deletion remove the account immediately, or create a request that your team completes, for example after open orders and returns are done?",
          statusChange: "blocked",
        },
        {
          kind: "customer_message",
          afterMinutes: 140,
          body: "Thank you Sam, now it's clearer. We have to keep invoices for 10 years (Italian law), so immediate deletion is a problem for our accountant. Can it be a request that our customer care handles? And can we really still make Thursday? The influencer posts are already booked.",
          statusChange: "in_progress",
        },
        {
          kind: "public_reply",
          afterMinutes: 30,
          body: "Yes, the request option fits well. The customer taps Delete account and confirms, and the account is closed right away: they can't log in anymore, their marketing consent is withdrawn and notifications stop. Your team sees the request under Customers > Deletion requests and completes it within 30 days. Order and invoice records you're required to keep stay, but they're detached from the customer profile.\n\nThat's what Apple asks for: the customer must be able to start the deletion in the app, and it can be completed later. For timing, you'll have a TestFlight build today, we submit as soon as you're happy with it, and Apple's review usually takes about a day. Thursday is realistic.",
        },
        {
          kind: "internal_note",
          authorId: "hana-kim",
          afterMinutes: 25,
          body: "Draft for the reply in App Store Connect, to send with the new build. Sam, please check:\n\n> Hello App Review team,\n>\n> Thank you for your feedback. Customers can now delete their account from within the app: Account > Privacy > Delete account. After confirming, the account is closed immediately and the deletion is completed within 30 days. Order records we must keep under Italian tax law are retained without personal profile data, as described in our privacy policy. For accounts created with Sign in with Apple, the token is revoked on deletion.\n>\n> The demo account in App Review Information is unchanged, so you can try the flow with it.\n>\n> Best regards",
        },
        {
          kind: "internal_note",
          afterMinutes: 95,
          body: "5.12.0 (1206) with `in_app_request` and the Apple token revoke is on TestFlight. Olivia ran it on an iPhone 15 with an Apple ID account and an email account: the request shows up in their admin, login is blocked right away, and the revoke call returns 200. Hana's draft is good, sending it as is with the submission.",
        },
        {
          kind: "public_reply",
          afterMinutes: 10,
          body: "The new build is in TestFlight for you and your team, you should have an email from TestFlight. Please try Account > Privacy > Delete account with a test account and tell us if the flow and wording work for you. You can change the texts under Mobile > Texts > Account deletion. As soon as you give us the go, we submit to Apple.",
          statusChange: "blocked",
        },
        {
          kind: "customer_message",
          afterMinutes: 180,
          body: "We tested it with Marco and Giulia, it works well. We changed the texts a little in Mobile > Texts. One question: the button is red, is this required by Apple? Our brand guidelines don't use red. Otherwise please go ahead!",
          statusChange: "in_progress",
        },
        {
          kind: "public_reply",
          afterMinutes: 20,
          body: "Red isn't required by Apple, it's the iPhone convention for actions that can't be undone, so customers recognise it. We'd suggest keeping it for now: changing the colour means another build, and we don't want to risk your date. We can switch it to your brand colour in a later update if you prefer.\n\nThe build is submitted, with a note to the reviewer explaining the new flow, and we've asked Apple for an expedited review because of your launch.",
        },
        {
          kind: "customer_message",
          afterMinutes: 1200,
          body: "It's been almost a day and it still says 'Waiting for Review'. Did Apple answer about the expedited review? I'm getting nervous. Also our Android colleague asks if Google needs the same thing.",
        },
        {
          kind: "public_reply",
          afterMinutes: 40,
          body: "Apple doesn't confirm expedited requests, they just move the app up the queue when they accept one, so 'Waiting for Review' is normal at this point. I'm watching it and will tell you the moment it changes.\n\nFor Android: Google Play asks for a web link where customers can request deletion, listed in your Data safety form. The same deletion flow is in the Android app with 5.12.0, and we'll add the web link to your Play listing, so there's nothing for your colleague to do.",
        },
        {
          kind: "internal_note",
          afterMinutes: 320,
          body: "Apple approved 5.12.0 (1206), about 22 hours after submission. Release is set to manual so Solstice can pick the moment. Android 5.12.0 with the same flow is in review on Play, and the deletion web link is in their Data safety form.",
        },
        {
          kind: "public_reply",
          afterMinutes: 10,
          body: "Good news Isabella: Apple approved the update. It's waiting in App Store Connect with manual release, so you decide when it goes live. We'd suggest releasing on Tuesday or Wednesday so most customers have it by Thursday. Deletion requests will appear under Customers > Deletion requests, and your team has 30 days to complete each one.\n\nI'm marking this as resolved, but reply here if anything comes up around the launch.",
          statusChange: "resolved",
        },
        {
          kind: "customer_message",
          afterMinutes: 95,
          body: "Thank you so much Sam, and thanks to your team for the quick work. We will release it Wednesday morning. Grazie!\n\nIsabella",
        },
      ],
    },
  ],
};
