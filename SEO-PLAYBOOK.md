# Gifted Minds Scholars — SEO & AEO Playbook

The website side is finished: fast pages, structured data, local landing page, FAQ, parent guides, llms.txt, image sitemap. For local searches like "tutor Loganville GA" or "reading tutor near me", Google mostly ranks on three things the site can't do by itself: **Google Business Profile, reviews and local citations**. Do the steps below in order.

## 1. Launch checklist (day 1)
- [ ] Connect the real domain in Vercel and set `siteUrl` in `config.json`, then push.
- [ ] Set `formEndpoint` in `config.json` (Formspree or Web3Forms) so inquiries reach Wendy's inbox.
- [ ] **Google Search Console**: add the domain, paste the HTML-tag code into `googleVerification`, push, verify, then submit `/sitemap.xml`.
- [ ] **Bing Webmaster Tools**: import from Search Console, or paste the code into `bingVerification`. Bing also powers ChatGPT search and Copilot answers.
- [ ] Optional: paste a GA4 ID into `ga4Id`.
- [ ] Submit the homepage with "Request indexing" in Search Console.

## 2. Google Business Profile (the most important item for "near me")
- [ ] Create or claim **Gifted Minds Scholars** at business.google.com.
- [ ] Primary category: **Tutoring service**. Secondary: **Educational consultant** or **Reading tutor** if offered.
- [ ] Service area: Loganville, Grayson, Snellville, Monroe, Between, Walnut Grove, Social Circle, Dacula, Lawrenceville. Hide the street address if she tutors from home.
- [ ] Phone **(770) 648-3356** and website URL, exactly as shown on the site.
- [ ] Hours: Sun 3:30–6:30, Mon 3:30–7:30, Tue 3:30–6:30, Thu 3:30–6:30.
- [ ] Description: use the "at a glance" facts and mention Pre-K–5th grade, reading, math, writing, in person and online.
- [ ] Add each program under **Services**.
- [ ] Upload 10+ real photos: Wendy, the classroom, reading and math wall displays, learning materials. No children's faces without written parent permission.
- [ ] Post a Google update every 2–4 weeks (tips, openings, seasonal reminders).

## 3. Reviews (they drive the map ranking)
- [ ] Ask every happy family, starting with Mrs. Grant and Mrs. Wade, to leave a **Google review**. Send the direct review link from the Business Profile.
- [ ] Reviews that mention the subject and town ("reading tutor in Loganville") help most. Never script or pay for them.
- [ ] Wendy replies to every review, thanking the family personally.
- [ ] Aim for 10 reviews in the first 60 days, then keep a steady flow.

## 4. Citations (same Name, Phone and City everywhere)
List **Gifted Minds Scholars · (770) 648-3356 · Loganville, GA · website** on:
- [ ] Bing Places, Apple Business Connect, Yelp, Facebook page, Nextdoor business page
- [ ] Loganville / Walton County Chamber of Commerce
- [ ] Care.com, Wyzant or Varsity Tutors profile (optional), local parent Facebook groups (posting only where the group rules allow)
- [ ] Link from bacb21.org to the new site, using anchor text like "Gifted Minds Scholars tutoring".

## 5. Content (for AEO: ChatGPT, Perplexity, Google AI Overviews)
AI answer engines quote pages that answer one question clearly. Add one new guide a month in `src/pages/resources/` by copying an existing article. Ideas:
- How to prepare your child for kindergarten
- What is phonics, and how does it help reading?
- How to help your child with math homework without tears
- Summer learning loss: how to keep skills sharp
- Supporting a child with dyslexia at home
- 3rd grade reading milestones: what parents should know

After adding a page, also link it from `/resources/`, add it to `src/public/llms.txt`, and push.

**Author credit:** the guides are currently credited to "Gifted Minds Scholars". If Wendy reviews and approves them, we can credit her as author, which adds expertise signals. Ask her.

## 6. Ongoing (monthly)
- [ ] Check Search Console: queries, impressions, any indexing errors.
- [ ] Update `yearsExperience` in `config.json` each year.
- [ ] Add new parent testimonials to the site, with the family's permission.
- [ ] Keep the hours in `config.json` and on the Google Business Profile identical.
