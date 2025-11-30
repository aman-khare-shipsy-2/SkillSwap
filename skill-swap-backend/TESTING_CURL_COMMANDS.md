# API Testing cURL Commands - Quick Reference

This document lists the **names** of all important cURL commands to test the Skill Swap Backend API locally.

**Base URL:** `http://localhost:5000/api`

---

## 1. Health Check

- Health Check

---

## 2. Authentication Endpoints

- Register New User
- Login User

---

## 3. User Endpoints (Requires Authentication)

- Get Current User Profile
- Update User Profile
- Add Offered Skill
- Remove Offered Skill
- Add Desired Skill
- Remove Desired Skill
- Get User Analytics

---

## 4. Skills Endpoints

- Get All Skills (with pagination)
- Get Skill by ID
- Create New Skill (Requires Authentication)
- Update Skill (Requires Authentication)
- Delete Skill (Requires Authentication)

---

## 5. Request Endpoints (Requires Authentication)

- Create Skill Exchange Request
- Get My Requests (Sent and Received)
- Search Users for Skill Exchange
- Accept Request
- Reject Request
- Forfeit Request

---

## 6. Chat Endpoints (Requires Authentication)

- Get My Chat Sessions
- Get Chat Session by ID (with paginated messages)
- Send Text Message
- Send Message with File Upload
- Upload File for Chat
- End Chat Session

---

## 7. Rating Endpoints (Requires Authentication)

- Create Rating
- Get My Ratings (Given and Received)
- Get Rating by ID

---

## 8. Verification Endpoints (Requires Authentication)

- Start Verification Test
- Submit Test Answers
- Get Verification Status
- Get Test by ID

---

## 9. Error Testing Scenarios

- Test Invalid Authentication Token
- Test Missing Required Fields
- Test Invalid ObjectId
- Test Rate Limiting
- Test File Upload Size Limit
- Test Invalid File Type

---

## Recommended Testing Order

1. Health Check
2. Register New User
3. Login User
4. Get Current User Profile
5. Create New Skill
6. Get All Skills
7. Get Skill by ID
8. Add Offered Skill
9. Add Desired Skill
10. Search Users for Skill Exchange
11. Create Skill Exchange Request
12. Get My Requests
13. Accept Request
14. Get My Chat Sessions
15. Get Chat Session by ID
16. Send Text Message
17. Upload File for Chat
18. Send Message with File Upload
19. Create Rating
20. Get My Ratings
21. Get User Analytics
22. End Chat Session
23. Start Verification Test
24. Submit Test Answers
25. Get Verification Status
26. Update User Profile
27. Update Skill
28. Reject Request
29. Forfeit Request
30. Remove Offered Skill
31. Remove Desired Skill
32. Delete Skill

---

**Total: 32 Important cURL Commands to Test**

