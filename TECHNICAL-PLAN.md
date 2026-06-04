# ⚙️**TECHNICAL PLAN – MATRIMONIAL PLATFORM (WEB + MOBILE APP)**

### **Tech Stack Overview**

| Layer                 | Technology                                       |
| --------------------- | ------------------------------------------------ |
| **Frontend (Web)**    | React / React Native                             |
| **Mobile App**        | React Native (Android & iOS)                     |
| **Backend**           | Node.js + Express.js, Nest Framework             |
| **Database**          | MongoDB (NoSQL)                                  |
| **Caching / Session** | Redis                                            |
| **Storage**           | AWS S3 (Profile Images, Documents)               |
| **Authentication**    | JWT / OAuth (Google, Facebook, Apple, Phone OTP) |
| **Deployment**        | AWS EC2, Load Balancer, CloudFront, Route53      |
| **Analytics**         | Mixpanel / Firebase Analytics                    |

---

## 🧱 **1. Core Modules**

1. **Authentication & Authorization**
2. **User Profile Management**
3. **Partner Preferences**
4. **AI Matchmaking**
5. **Search & Filters**
6. **Interest / Request System**
7. **Chat & Messaging**
8. **Payment & Subscription**
9. **Admin Panel**
10. **Notifications (Email, Push, SMS)**

---

## 🧩 **2. API Design Structure**

Here’s a modular RESTful API plan:

---

### **A. AUTHENTICATION APIs**

| Method | Endpoint                | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| POST   | `/auth/register`        | Register user (email/phone/social) |
| POST   | `/auth/login`           | Login using email/password         |
| POST   | `/auth/social-login`    | Login with Google/Facebook/Apple   |
| POST   | `/auth/send-otp`        | Send OTP for phone signup/login    |
| POST   | `/auth/verify-otp`      | Verify OTP for phone signup/login  |
| POST   | `/auth/refresh`         | Get new access token by refresh    |
| POST   | `/auth/resend-otp`      | Resend OTP                         |
| POST   | `/auth/forgot-password` | Send reset password link/OTP       |
| PUT    | `/auth/reset-password`  | Reset user password                |
| GET    | `/auth/logout`          | Logout and invalidate token        |

---

### **B. USER PROFILE APIs**

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| GET    | `/user/profile/:id`       | Get user profile details       |
| PUT    | `/user/profile`           | Update profile details         |
| PUT    | `/user/profile/photo`     | Upload/Update profile photo    |
| GET    | `/user/preferences`       | Get partner preference         |
| PUT    | `/user/preferences`       | Update partner preference      |
| GET    | `/user/match-suggestions` | Get AI-based suggested matches |
| GET    | `/user/blocked`           | Get blocked users list         |
| POST   | `/user/block/:id`         | Block a user                   |
| DELETE | `/user/block/:id`         | Unblock user                   |

---

### **C. MATCHMAKING APIs**

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| GET    | `/matches/recommended` | Get algorithmic matches      |
| GET    | `/matches/recent`      | Recently joined users        |
| GET    | `/matches/nearby`      | Matches by location          |
| POST   | `/matches/report/:id`  | Report a profile (spam/fake) |

---

### **D. INTEREST & REQUEST APIs**

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| POST   | `/interest/send/:id`   | Send interest/request   |
| GET    | `/interest/received`   | Get received requests   |
| GET    | `/interest/sent`       | Get sent requests       |
| PUT    | `/interest/accept/:id` | Accept interest/request |
| PUT    | `/interest/reject/:id` | Reject interest/request |
| DELETE | `/interest/cancel/:id` | Cancel interest         |

---

### **E. CHAT / MESSAGING APIs**

| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| GET    | `/chat/rooms`            | List chat rooms             |
| POST   | `/chat/start/:userId`    | Start new chat              |
| GET    | `/chat/messages/:roomId` | Get messages from chat room |
| POST   | `/chat/message`          | Send new message            |
| PUT    | `/chat/message/:id/read` | Mark as read                |
| DELETE | `/chat/room/:id`         | Delete chat room            |

(Chat module will use **Socket.io** for real-time updates.)

---

### **F. PAYMENT & SUBSCRIPTION APIs**

| Method | Endpoint           | Description                      |
| ------ | ------------------ | -------------------------------- |
| GET    | `/plans`           | List subscription plans          |
| POST   | `/plans/subscribe` | Subscribe to a plan              |
| GET    | `/plans/history`   | Subscription/payment history     |
| POST   | `/payment/verify`  | Verify payment (Razorpay/Stripe) |

---

### **G. ADMIN PANEL APIs**

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| POST   | `/admin/login`           | Admin authentication   |
| GET    | `/admin/users`           | List users             |
| PUT    | `/admin/user/:id/status` | Approve/suspend user   |
| GET    | `/admin/reports`         | View reported profiles |
| GET    | `/admin/dashboard`       | Get system stats       |
| GET    | `/admin/payments`        | View transactions      |

---

### **H. NOTIFICATIONS APIs**

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/notifications`           | Get all user notifications       |
| POST   | `/notifications/mark-read` | Mark notification as read        |
| POST   | `/notifications/send`      | Send notification (admin/system) |

---

## 🧠 **3. Database Design (MongoDB Collections)**

### **1. users**

```js
{
  _id: ObjectId,
  first_name: String,
  last_name: String,
  gender: String, // male/female/other
  dob: Date,
  email: String,
  phone: String,
  password_hash: String,
  provider: String,
  providerId: String,
  religion: String,
  caste: String,
  language: String,
  country: String,
  state: String,
  city: String,
  education: String,
  profession: String,
  income: String,
  marital_status: String,
  height: Number,
  weight: Number,
  profile_photo: String,
  gallery: [String],
  verification_status: String, // pending/verified/rejected
  is_premium: Boolean,
  last_login: Date,
  created_at: Date,
  updated_at: Date
}
```

---

### **2. preferences**

```js
{
  _id: ObjectId,
  user_id: ObjectId,
  preferred_gender: String,
  age_range: { min: Number, max: Number },
  religion: [String],
  caste: [String],
  education: [String],
  country: [String],
  state: [String],
  marital_status: [String],
  height_range: { min: Number, max: Number },
  income_range: { min: Number, max: Number },
  created_at: Date,
  updated_at: Date
}
```

---

### **3. interests**

```js
{
  _id: ObjectId,
  sender_id: ObjectId,
  receiver_id: ObjectId,
  status: String, // pending, accepted, rejected
  created_at: Date,
  updated_at: Date
}
```

---

### **4. chats**

```js
{
  _id: ObjectId,
  participants: [ObjectId], // user IDs
  last_message: String,
  last_updated: Date
}
```

### **5. messages**

```js
{
  _id: ObjectId,
  chat_id: ObjectId,
  sender_id: ObjectId,
  message: String,
  message_type: String, // text, image
  is_read: Boolean,
  created_at: Date
}
```

---

### **6. subscriptions**

```js
{
  _id: ObjectId,
  user_id: ObjectId,
  plan_id: ObjectId,
  payment_id: String,
  amount: Number,
  start_date: Date,
  end_date: Date,
  status: String, // active, expired, canceled
  created_at: Date
}
```

---

### **7. plans**

```js
{
  _id: ObjectId,
  name: String,
  duration_days: Number,
  price: Number,
  features: [String],
  created_at: Date
}
```

---

### **8. reports**

```js
{
  _id: ObjectId,
  reporter_id: ObjectId,
  reported_user_id: ObjectId,
  reason: String,
  status: String, // open, resolved
  created_at: Date
}
```

---

### **9. notifications**

```js
{
  _id: ObjectId,
  user_id: ObjectId,
  title: String,
  message: String,
  type: String, // info, match, system
  is_read: Boolean,
  created_at: Date
}
```

---

## 🔗 **4. Entity Relationships (ER Diagram Summary)**

```
User (1) —— (1) Preferences
User (1) —— (M) Interests (as sender or receiver)
User (1) —— (M) Chats —— (M) Messages
User (1) —— (M) Subscriptions
User (1) —— (M) Reports
User (1) —— (M) Notifications
```

---

## 🧮 **5. AI Matchmaking Logic (Basic Concept)**

* **Input:** User profile attributes + preferences
* **Algorithm:** Weighted matching score based on:

  * Age (10%)
  * Religion/Caste (20%)
  * Education (10%)
  * Location proximity (15%)
  * Personality interests (10%)
  * Mutual likes (10%)
  * Activity level (5%)
  * Premium boost (20%)
* **Output:** Sorted list of recommended matches.

(Phase 2: integrate TensorFlow/Python ML model for learning match success patterns.)

---

## 📡 **6. Infrastructure Plan**

| Layer                  | Description                               |
| ---------------------- | ----------------------------------------- |
| **API Gateway**        | NGINX / AWS API Gateway                   |
| **Backend Cluster**    | Node.js with Load Balancer (Auto Scaling) |
| **Database Cluster**   | MongoDB Atlas / AWS DocumentDB            |
| **File Storage**       | AWS S3                                    |
| **CDN**                | AWS CloudFront                            |
| **Push Notifications** | Firebase Cloud Messaging                  |
| **Email/SMS**          | SendGrid / Twilio                         |
| **Monitoring**         | AWS CloudWatch + ELK stack                |

---

## 🔐 **7. Security Plan**

* JWT-based user authentication
* Password hashing with bcrypt
* OTP verification for signup/login
* Rate limiting and API throttling
* HTTPS enforced
* Data validation using Joi/Zod
* Role-based access for Admin APIs
* Periodic penetration tests

---

## 🚀 **8. Deployment Pipeline (CI/CD)**

1. **GitHub → CodePipeline → EC2 (Staging)**
2. **Automated Tests → Approval → Production Deploy**
3. **Docker Containers for Node.js & Mongo**
4. **S3 + CloudFront for Web Static Files**
5. **Firebase App Distribution for Mobile Testing**

---