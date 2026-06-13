# 🎨**UI/UX WIREFRAME BLUEPRINT – MATRIMONIAL PLATFORM**

### 📱 Platforms:

> Current home: `docs/planning/FLOW-PLAN.md`
>
> Purpose: user journeys, screen flows, and UX blueprint for web, Android, and iOS.

* **Web (Desktop + Responsive)**
* **Mobile App (Android & iOS, React Native)**

---

## 🧭 **1. Overall User Flow**

```
Splash / Welcome Screen
      ↓
Login / Register (Email | Phone | Google | Facebook | Apple)
      ↓
Onboarding Setup (Profile Creation + Preferences)
      ↓
Home Dashboard
   ├── Recommended Matches
   ├── New Users
   ├── Profile View
   ├── Like / Send Interest
      ↓
Match Requests (Received / Sent)
      ↓
Chat (Real-Time)
      ↓
Upgrade Plan (Subscription)
      ↓
Settings / Account / Logout
```

Admin Portal (separate)

```
Login → Dashboard → Users → Reports → Subscriptions → Analytics
```

---

## 💡 **2. Main Web Modules & Wireframes**

### **A. Landing Page**

* Header:
  * Logo (left)
  * Menu: Home | Search | About | Contact | Login / Register
* Hero Banner: “Find Your Perfect Match”
* Call-to-Action: *Start Now* button
* Featured Members Carousel
* Testimonials
* Footer: Links, Privacy Policy, Terms

**CTA Buttons:** “Join Free” → Registration Page

---

### **B. Registration Page**

* Tabs:

  * **Signup with Email/Phone**
  * **Signup with Google/Facebook**
* Fields:
  * Full Name
  * Gender
  * Date of Birth
  * Email / Phone
  * Password
  * OTP Verification (for Phone)
* Button: “Continue”
* Progress Indicator: Step 1 of 3 (Next → Profile Details)

---

### **C. Profile Setup**

* Upload Profile Photo
* Basic Details (Education, Profession, City)
* Religious Info (Religion, Caste)
* Family Info (Optional)
* Preferences (Age range, Location, Education)
* Button: “Save & Continue to Dashboard”

---

### **D. Home Dashboard**

* **Top Bar:** Search | Notifications | Profile Icon
* **Side Bar:** Home, Matches, Interests, Chat, Upgrade, Settings
* **Main Area:**

  * Tabs: “Recommended”, “New”, “Nearby”
  * User Cards Grid:
    * Photo
    * Name, Age, City
    * “View Profile” | “Send Interest” buttons

---

### **E. Profile View**

* Left: Profile Image (carousel)
* Right: Details
  * Basic Info
  * Education & Career
  * Family Info
  * Partner Preferences
  * Buttons: “Send Interest”, “Chat Now”, “Block”, “Report”

---

### **F. Chat Module**

* Left Panel: List of Conversations (user name + last message)
* Right Panel:
  * Chat Header (User name + Online status)
  * Chat Window (Messages + Images)
  * Message Input Box + Send Icon
* Real-time via **Socket.io**

---

### **G. Interest / Requests Page**

* Tabs: “Received” | “Sent”
* Card View:
  * User Image + Name + Age + Location
  * Buttons: Accept | Reject | Chat

---

### **H. Subscription Page**

* Display Plans (Basic, Premium, Elite)
* Plan Comparison Table
* Features List per Plan
* Button: “Upgrade Now”
* Razorpay / Stripe Integration

---

### **I. Settings Page**

* Account Info (Edit Profile, Change Password)
* Privacy Settings (Show/hide details)
* Blocked Users
* Logout

---

### **J. Admin Dashboard**

* Login → Dashboard
* Panels:
  * User Count, Active Matches, Revenue, Reports
  * User Management (CRUD)
  * Reports Handling
  * Subscription Management
  * Analytics (Charts for engagement)

---

## 📲 **3. Mobile App Wireframe Flow (React Native)**

**Navigation:**

* Bottom Tab Bar → `Home | Matches | Chats | Requests | Profile`
* Top Right Icons → Notifications, Settings

---

### **1. Splash Screen**

* App logo + tagline
* Auto redirect to Login

### **2. Login / Signup Screen**

* Buttons: “Login with Phone”, “Login with Google”, “Login with Facebook”
* OTP-based verification (if phone)
* Option: “Continue as Guest” (limited access)

### **3. Onboarding Flow (3–4 Steps)**

1. Upload Profile Photo
2. Add Basic Details (DOB, Gender, Religion)
3. Set Preferences
4. Done → Go to Home

### **4. Home Screen**

* Top Section:
  * Search bar
  * Chips: “Recommended”, “New”, “Nearby”
* Card Swipe UI:
  * Swipe right = Like
  * Swipe left = Skip
  * Tap = View Profile
* Bottom Nav Tabs

---

### **5. Profile Screen**

* Profile Image + Gallery
* Tabs:
  * About
  * Education & Profession
  * Partner Preferences
* Buttons: “Send Interest” | “Chat” | “Report”

---

### **6. Chat Screen**

* Chat list view (user photo + name + message preview)
* Tap → Chat room
  * Real-time messages
  * Typing indicator
  * Media send option

---

### **7. Requests Screen**

* Tabs:
  * “Received” | “Sent”
* Card layout for each user
* Buttons: Accept / Reject / View Profile

---

### **8. Upgrade Screen**

* Subscription Plans
* Payment Flow → Razorpay/Stripe Modal
* Success Page → “Your plan is now active!”

---

### **9. Settings Screen**

* Profile Edit
* Privacy Preferences
* Notifications toggle
* Logout

---

### **Mobile Flow Summary**

```
Splash
 ↓
Login/Signup
 ↓
Onboarding Setup
 ↓
Home (Matches)
 ↓
View Profile → Chat or Send Interest
 ↓
Requests → Accept → Chat
 ↓
Upgrade to Premium
 ↓
Settings / Logout
```

---

## 🧩 **4. Design Guidelines**

| Element            | Recommendation                                              |
| ------------------ | ----------------------------------------------------------- |
| **Color Palette**  | Warm + Trust tones (e.g., #E63946, #F1FAEE, #1D3557)  |
| **Typography**     | Poppins / Lato                                              |
| **Icons**          | Lucide / Feather                                            |
| **Layout System**  | 8pt Grid                                                    |
| **UI Frameworks**  | Bootstrap (Web), NativeBase (Mobile)                        |
| **Style Language** | TailwindCSS / Styled Components                             |
| **Animations**     | Framer Motion (Web), Lottie (Mobile)                        |

---

## 🖼️ **5. Deliverables to Visualize Next**

[Web Wireframe](Wireframe-Web.png)

---

## 🧩 3. Suggested Tech Stack

| Layer                      | Technology                     | Reason                                    |
| -------------------------- | ------------------------------ | ----------------------------------------- |
| **Backend Framework**      | NestJS                         | Enterprise-grade modularity & scalability |
| **Database**               | MongoDB                        | Flexible schema for profile & match data  |
| **ODM**                    | Mongoose                       | Schema-based, mature, NestJS-friendly     |
| **Cache**                  | Redis                          | For quick matchmaking & chat performance  |
| **API Gateway**            | GraphQL (or REST with Swagger) | Optimized query fetching for profiles     |
| **Authentication**         | JWT + Passport.js + OAuth      | Supports Email/OTP + Social logins        |
| **Realtime Communication** | Socket.io                      | For chat & live status                    |
| **Cloud Deployment**       | AWS (ECS / Lambda / EC2 + S3)  | Scalable and reliable                     |
| **CI/CD**                  | GitHub Actions / Jenkins       | Continuous deployment                     |
| **Testing**                | Jest / Supertest               | For API and unit testing                  |

---


# New Screen Flow Plan for Mobile App (Updated on : 2026-06-08)

## 📱 10 Flow Sections Explained

**① Auth** — Splash → Welcome → Login/Register (Email, Phone OTP, Google, Facebook, Apple) → Forgot Password → OTP Verification. Both login and register paths merge into onboarding.

**② Onboarding (6 steps)** — Progressive profile building: Basic info → Location & family → Education & career → Lifestyle → Partner preferences → Photos & bio. Designed to feel lightweight (2 screens per step) rather than one overwhelming form.

**③ Bottom Navigation** — 5 tabs: Home, Matches, Activity, Chats, Membership. Always accessible after onboarding.

**④ Home** — Top nav with profile icon (left) + notifications + settings (right). Three content modes: Tinder-style swipe card, grid/list view, and daily curated picks. All tap into the same **Profile Detail screen** which has Send Interest, Block, Report, and Share.

**⑤ Matches** — Full match list with a dedicated Filter panel (age, religion, caste, education, income, diet), Match cards, and Sort options. This is the JeevanSathi/Shaadi.com-style browse experience.

**⑥ Activity** — 5 sub-tabs: Interest Sent, Interest Received, Who Viewed Me (premium gate), Online Matches, and Shortcuts (chat requests, saved, ignored).

**⑦ Chat** — Chat list with unread badges and online dots → Conversation screen with text, image, voice + read receipts + typing indicator. Chat Controls screen for block/report/mute and premium video call.

**⑧ Membership** — Free / Gold / Platinum plan cards with feature comparison → Payment screen with UPI, Card, Net Banking, Wallet (Razorpay/Stripe).

**⑨ My Profile** — Accessible via top-nav profile icon. Edit sections, photo management with reordering, and privacy controls (who sees your profile, block list).

**⑩ Settings & Notifications** — Settings covers account, password, blocked users, deactivation. Notifications screen lists all events (interests, matches, messages, views) with tap-to-navigate and push/email/SMS preference toggles.

## 💡 Key Design Decisions

- **Dual browse mode** on Home (swipe + grid) captures both Tinder-style swipers and traditional Shaadi-style browsers
- **Activity tab** replaces the usual "inbox" pattern — it's a complete interaction hub
- **Premium gates** are placed on high-value features (Who Viewed Me, Video Call, Priority listing) rather than core browsing — this keeps free users engaged
- **Profile completion bar** on My Profile nudges users to fill out more details, which directly improves match quality


## 🔔 Complete Notification Categories

### Interactions
- `New interest received` — the most important alert; all 3 channels on by default
- `Interest accepted` — push + email only (no SMS needed for positive events)
- `Profile viewed` — push only by default; gated behind Gold+ membership
- `Shortlisted by someone` — push only; low urgency

### Messages
- `New message` — all 3 channels; highest urgency for active conversations
- `Video call request` — push only (time-sensitive); Platinum-gated
- `Chat request` — push only; requires manual approval from user

### Matches & Suggestions
- `New match suggestion` — has a frequency control (Instant / Daily / Weekly) so users aren't overwhelmed
- `Online now alert` — off by default; opt-in only since it can feel intrusive
- `Profile score boost` — push + email; helpful nudge, not disruptive

### Account & Membership
- `Membership expiry` — all 3 channels; critical reminder 7 days + 1 day before
- `Payment confirmation` — push + email; standard receipt flow
- `Security alerts` — all 3 channels, **toggle disabled** (cannot be turned off — this is a safety requirement)
- `Promotions & offers` — email only by default; opt-in for push/SMS

### Quiet Hours
- `Do not disturb` — expands a time picker (From / To) to define the silent window

## 💡 Key UX Decisions

**3-channel pills (Push / Email / SMS)** — users control the delivery channel per notification type, not just on/off. This is the pattern used by LinkedIn, Shaadi.com, and most modern apps.

**Master toggle** — silences everything at once. Disables all individual toggles while keeping their state so re-enabling restores the previous config.

**Security alerts are locked** — they cannot be disabled regardless of master toggle state. This is a legal and safety requirement in most markets.

**Frequency control on match suggestions** — prevents the most common reason users uninstall matrimonial apps (too many low-quality notifications).

**Membership gates are visible** — Gold+ and Platinum badges on locked features drive upgrade awareness naturally within settings.

**Default state philosophy:**
- High-value interactions → all channels on
- Casual suggestions → push only
- Marketing → email only, push off
- Security → all channels, always on
