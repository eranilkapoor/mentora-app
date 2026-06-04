# 🎨**UI/UX WIREFRAME BLUEPRINT – MATRIMONIAL PLATFORM**

### 📱 Platforms:

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
