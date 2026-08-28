# Google Ads Setup Guide for Concrete Concepts Group

**Account ID:** AW-6553093174

This guide walks you through setting up conversion actions in your Google Ads account to match the tracking already installed on your website. Once these are configured, Google will optimise your ad spend towards people most likely to submit a quote request.

---

## Step 1: Create Conversion Actions

Log in to [Google Ads](https://ads.google.com) and navigate to **Goals > Conversions > Summary > New conversion action > Website**.

Create the following 4 conversion actions:

| Conversion Name | Category | Value | Count | Attribution |
|---|---|---|---|---|
| Quote Submission | Submit lead form | $5,000 AUD | Every | Data-driven |
| Phone Call Click | Phone call lead | $3,000 AUD | Every | Data-driven |
| Callback Request | Submit lead form | $4,000 AUD | Every | Data-driven |
| WhatsApp Click | Other | $2,000 AUD | Every | Data-driven |

For each action, when asked "How do you want to set up this conversion?", choose **"Use a tag that's already on your website"** — the gtag.js code is already installed.

### Matching Conversion Labels

Your website fires these events automatically. In Google Ads, the conversion action names must match these labels:

- `AW-6553093174/quote_submission` — fires when a customer submits the quote form
- `AW-6553093174/phone_call_click` — fires when someone taps/clicks the phone number
- `AW-6553093174/callback_request` — fires when someone uses the callback widget
- `AW-6553093174/whatsapp_click` — fires when someone clicks the WhatsApp button

When creating each conversion action, copy the **Conversion Label** from Google Ads and update it in your website code if it differs from the labels above. The format is `AW-6553093174/XXXXXXX`.

---

## Step 2: Enable Enhanced Conversions

Enhanced conversions are already enabled on your website. This sends hashed customer data (email, phone, name) with each conversion event so Google can match conversions to ad clicks more accurately — especially important for mobile users.

To activate in Google Ads:

1. Go to **Goals > Conversions > Settings**
2. Click **Enhanced conversions**
3. Turn on **Enhanced conversions for leads**
4. Select **Global site tag (gtag.js)** as the method
5. Save

Your website already sends the hashed data automatically when a customer submits a quote.

---

## Step 3: Set Up Remarketing Audiences

Your website already sends remarketing signals. To use them for ad targeting:

1. Go to **Tools > Audience Manager > Audience lists**
2. Click **+ New audience list > Website visitors**
3. Create these audiences:

| Audience Name | Rule | Duration |
|---|---|---|
| All Visitors (30 days) | Visited any page | 30 days |
| All Visitors (90 days) | Visited any page | 90 days |
| Service Page Viewers | URL contains `/services/` | 30 days |
| Calculator Users | URL contains `/calculator` | 30 days |
| Quote Form Starters | URL contains `#contact` | 14 days |
| Blog Readers | URL contains `/blog/` | 60 days |
| Suburb Page Viewers | URL contains `/areas/` | 30 days |

4. Create a **remarketing campaign** targeting "All Visitors (30 days)" excluding converters (people who already submitted a quote).

---

## Step 4: Set Up Call Tracking (Phone Calls from Ads)

For tracking calls that come directly from your Google Ads call extensions:

1. Go to **Goals > Conversions > New conversion action > Phone calls**
2. Select **Calls from ads using call extensions or call-only ads**
3. Set:
   - Conversion name: "Phone Call from Ad"
   - Value: $3,000 AUD
   - Call length: 60 seconds (counts as a conversion if the call lasts 60+ seconds)
   - Count: Every conversion
4. Save

Then add a **Call Extension** to your campaigns:
1. Go to **Ads & extensions > Extensions**
2. Click **+ Call extension**
3. Phone number: **0424 463 268**
4. Enable call reporting

---

## Step 5: Campaign Structure Recommendation

For a concreting business in Brisbane, here's the recommended campaign structure:

### Campaign 1: Search — High Intent Services
**Budget:** $30-50/day | **Bidding:** Maximise conversions

| Ad Group | Keywords | Landing Page |
|---|---|---|
| Driveways | concrete driveway brisbane, driveway concreter near me | /lp/concrete-driveways |
| Slabs | concrete slab brisbane, shed slab concreter | /lp/concrete-slabs |
| Exposed Aggregate | exposed aggregate brisbane, exposed aggregate driveway | /lp/exposed-aggregate |
| Retaining Walls | retaining wall brisbane, concrete retaining wall | /lp/retaining-walls |
| Patios | concrete patio brisbane, outdoor entertaining area concrete | /lp/concrete-patios |

### Campaign 2: Search — Suburb Targeting
**Budget:** $20-30/day | **Bidding:** Maximise conversions

Create ad groups for your top-performing suburbs (Logan, Carindale, Springfield, etc.) with keywords like "concreter [suburb]" and direct to the suburb landing pages.

### Campaign 3: Remarketing — Display
**Budget:** $10-15/day | **Bidding:** Target CPA

Target your "All Visitors (30 days)" audience with display ads showing your before/after photos and a "Get Your Free Quote" CTA.

---

## Step 6: Conversion Value Tracking

Your website assigns these values to help Google's Smart Bidding optimise for high-value leads:

| Action | Assigned Value | Rationale |
|---|---|---|
| Quote Submission | $5,000 | Average concreting job value |
| Phone Call Click | $3,000 | Phone leads slightly less qualified |
| Callback Request | $4,000 | High intent — requested a callback |
| WhatsApp Click | $2,000 | Lower intent — casual enquiry |

These values help Google's algorithm bid more aggressively for users likely to submit a quote (highest value action) vs. just clicking WhatsApp.

---

## Quick Checklist

- [ ] Create 4 conversion actions in Google Ads (Quote, Phone, Callback, WhatsApp)
- [ ] Enable Enhanced Conversions in Google Ads settings
- [ ] Create remarketing audiences (7 lists)
- [ ] Set up call extension with 0424 463 268
- [ ] Create at least 1 search campaign targeting high-intent keywords
- [ ] Create 1 remarketing display campaign
- [ ] Set daily budget and enable Smart Bidding (Maximise Conversions)
- [ ] Let campaigns run 2-3 weeks before optimising (Google needs conversion data)

---

## Google Local Services Ads (LSA)

Google LSA puts you in the **"Google Guaranteed"** section at the very top of search results — above regular ads and organic listings. This is the most premium ad placement for local trades.

### How to Apply

1. Go to [ads.google.com/local-services-ads](https://ads.google.com/local-services-ads)
2. Click **Get Started**
3. Select your business category: **Concrete Contractor**
4. Enter your details:
   - Business: Concrete Concepts Group Pty Ltd
   - Phone: 0424 463 268
   - Service area: Brisbane, South East Queensland
   - QBCC Licence: #15299707
   - ABN: (your ABN)

### What You'll Need

| Document | Details |
|---|---|
| QBCC Licence | #15299707 — must be current |
| Public Liability Insurance | Certificate of currency |
| ABN | Active ABN for Concrete Concepts Group Pty Ltd |
| Google Business Profile | Must be verified (yours already exists) |
| Background check | Google will run a background check on the business owner |

### LSA Pricing

LSA charges per **lead** (not per click). Typical costs for concreting in Brisbane:

- $20-50 per lead (phone call or message)
- You only pay for valid leads
- You can dispute invalid leads for a refund
- Set a weekly budget cap (recommended: $200-400/week to start)

### LSA Benefits

- **"Google Guaranteed" badge** — builds instant trust
- **Top of search results** — above all other ads
- **Pay per lead** — not per click (better ROI)
- **Dispute bad leads** — get refunds for spam/wrong area
- **Reviews shown** — your 5-star rating appears in the ad

### Timeline

- Application: 1-2 weeks for approval
- Background check: 2-4 weeks
- Live ads: 3-6 weeks from application

Apply as soon as possible — the background check takes the longest.
