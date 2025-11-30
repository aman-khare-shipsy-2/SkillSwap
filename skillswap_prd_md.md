# Skill Swap PRD

## Implementation Process

1. [✅] UI Designing
2. [✅] Database Models Design
3. [✅] Figure out user flows
4. [ ] Code Backend API
5. [ ] Code Frontend

## Tech Stack

- MongoDB
- Express JS
- Node JS
- Mongoose
- ReactJS
- React Charts
- JWT
- BCrypt

## UI

[Design File](https://drive.google.com/file/d/1b3bmTI3a7MFuPIoa1GDd_WX5YzVBr1hD/view?usp=sharing)

## FlowChart

*(FlowChart reference - see original document)*

## User Flow

### Sign in / Sign up
- If Sign up (new account) then select skills you offer
- Redirected to dashboard having 4 tabs:

#### Analytics Tab
Displays:
- The user's rating
- Total sessions he has taken
- Total skills he has learnt
- A graph where ratings given to the user in last 20 gigs are plotted. Users can select to view their rating in a particular skill too using a dropdown.

#### My Skills Tab
Shows:
- Button to add new skill
- Table containing the list of skills the user has to offer with each row containing:
  - Skill Name
  - Average Rating in that skill
  - If the user is verified using the expert test
  - If not verified then each row will have a verify button that will begin the test

#### My Learnings Tab
Displays:
- Skill the user is currently learning (if any)
- Skills the user wish to learn with an add new button
- Skills they have already learnt using the platform

#### Requests Tab
Displays:
- Skill exchange requests he has made with a forfeit button
- Skill exchange requests he has received with accept/reject buttons

### Dashboard Features

- **Search Bar**: User can search desired skill he/she needs to learn. Upon typing in the skill name and clicking the search button, a list of people will appear offering that skill and needing a skill our user is offering, sorted by their average rating in that particular skill. Choose the one you like and send them a skill exchange request.

- **Request Handling**: If they accept the request, knowledge transfer will begin. If not accepted within 30 days, the skill exchange request will expire automatically.

- **Logout**: The dashboard will also have a logout button which will log the user out and redirect to the sign in page.

### Knowledge Transfer

Knowledge transfer will happen using a real-time chat where users can send:
- Text messages
- Images
- Videos (20 mins max)
- Documents (PDF and Word)
- Links
- Emojis

---

## DB Models

### 🧩 1. User Model
Stores all user account and profile-related details.

**Fields:**
- `_id` – unique identifier
- `name` – full name of the user
- `email` – user's email (unique)
- `passwordHash` – encrypted password
- `profilePictureURL` – optional profile photo
- `bio` – short about section
- `location` – city or region (optional, useful for local learning)
- `offeredSkills` – array of skill IDs the user can teach
- `desiredSkills` – array of skill IDs the user wants to learn
- `averageRating` – overall average rating across all taught skills
- `verifiedSkills` – array of skill IDs for which the user has passed the expert test
- `totalSessionsTaught` – count of sessions taught
- `totalSkillsLearnt` – count of unique skills learned
- `ratingsHistory` – array of recent rating objects (e.g., rating, skill, session ID, timestamp)
- `createdAt` – account creation date
- `updatedAt` – last updated timestamp
- `isActive` – whether the account is active

### 🧠 2. Skill Model
Defines all possible skills available on the platform.

**Fields:**
- `_id` – unique skill ID
- `name` – skill name (e.g., "Guitar", "Cooking")
- `category` – broad category (e.g., "Music", "Culinary")
- `description` – short overview of the skill
- `createdBy` – admin or user who first listed the skill
- `createdAt` – date added

### 🔁 3. SkillRequest Model
Represents a skill exchange proposal between two users.

**Fields:**
- `_id` – unique request ID
- `senderId` – user initiating the request
- `receiverId` – user receiving the request
- `offeredSkillId` – skill that sender offers to teach
- `requestedSkillId` – skill that sender wants to learn
- `status` – "pending", "accepted", "rejected", or "expired"
- `createdAt` – date request was made
- `expiresAt` – date after which it auto-expires (30 days)
- `acceptedAt` – date of acceptance (if any)
- `rejectedAt` – date of rejection (if any)
- `forfeitedBy` – user who canceled the exchange (if any)

### 💬 4. ChatSession Model
Created when a skill exchange request is accepted — enables communication and content sharing.

**Fields:**
- `_id` – unique chat ID
- `requestId` – link to associated SkillRequest
- `participants` – array of two user IDs
- `messages` – array of message objects (see below)
- `createdAt` – when chat started
- `endedAt` – when session concluded

**Each message object contains:**
- `senderId` – user who sent the message
- `type` – "text", "image", "video", "document", "link"
- `contentURL / text` – message text or file URL
- `timestamp` – when sent

### ⭐ 5. Rating Model
Stores feedback after each skill exchange session.

**Fields:**
- `_id` – unique rating ID
- `ratedUserId` – user being rated
- `ratedById` – user giving the rating
- `skillId` – skill taught in that session
- `score` – numerical rating (e.g., 1–5)
- `comment` – optional written feedback
- `sessionId` – reference to the chat/session if relevant
- `createdAt` – timestamp

### 🧾 6. VerificationTest Model
Handles skill verification for users claiming expertise.

**Fields:**
- `_id` – unique test ID
- `userId` – user taking the test
- `skillId` – skill for which test is taken
- `questions` – array of question objects (text, options, correct answer)
- `score` – numeric test result
- `status` – "pending", "passed", or "failed"
- `attemptedAt` – timestamp of attempt
- `verifiedAt` – timestamp when marked verified (if passed)

### 📊 7. Analytics Model
Stores data for charts and dashboards.

**Fields:**
- `_id` – unique record ID
- `userId` – linked user
- `skillId` – optional, for skill-specific analytics
- `ratingsTrend` – array of last N (e.g., 20) ratings for chart plotting
- `sessionsPerMonth` – number of sessions taught/learned monthly
- `totalRatingAverage` – rolling average
- `updatedAt` – last analytics refresh date

---

## 🔗 Model Relationships Summary

- **User ↔ Skill**: Many-to-many via offeredSkills / desiredSkills arrays
- **User ↔ SkillRequest**: One user can send or receive many requests
- **SkillRequest ↔ ChatSession**: One-to-one (each accepted request = one chat)
- **ChatSession ↔ Message**: One-to-many (chat has many messages)
- **User ↔ Rating**: Users can rate and be rated by others (two-way)
- **User ↔ VerificationTest**: One user can take many tests
- **User ↔ Analytics**: One-to-one