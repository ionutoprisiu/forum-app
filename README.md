# Forum App

Q&A forum: post questions, answer, vote, tag, search. Backend in Spring Boot, frontend in React.

## Description

Forum App is a question-and-answer site: users register, ask questions (with optional images and tags), and others can answer. You can vote on questions and answers, and the author of a question can mark one answer as accepted. The list of questions supports search, filters by tag or by user, and sorting (newest, oldest, most voted, unanswered), with pagination.

There are two roles: normal users and moderators. Moderators can ban users and edit or delete any question or answer. Each user has a profile with basic stats (questions, answers, votes) and can edit their data or delete their account; when an account is deleted, all their content is removed and questions that had their answer accepted are reset to “open”.

The backend is a REST API (Spring Boot, PostgreSQL). The frontend is a single-page app in React that talks to this API. The UI uses a dark theme with an orange accent and is built so that all main pages share the same look and feedback (toasts, error messages, 404) is consistent.

## Tech

- **Backend:** Java 21, Spring Boot 4, JPA, PostgreSQL, Lombok
- **Frontend:** React 19, React Router, Axios. Dark theme, orange accent.

## Run it

You need Java 21, Node 16+, PostgreSQL, Maven.

**Database:** create a DB (e.g. `createdb forumdb`). Copy `ForumAppBackend/src/main/resources/application.properties.example` to `application.properties` in the same folder, then set your DB username and password there. `application.properties` is gitignored so your credentials are not committed.

**Backend:**
```bash
cd ForumAppBackend
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`.

**Frontend:**
```bash
cd ForumAppFrontend
npm install
npm start
```
Runs on `http://localhost:3000`. The app talks to the backend at 8080; change `baseURL` in `ForumAppFrontend/src/services/api.js` if your backend is elsewhere.

## What’s in it

- Auth: login, register, logout. Clear error when account doesn’t exist or password is wrong.
- Questions: create, edit, delete, search (with debounce), filter by tag or user, sort (newest, oldest, most voted, unanswered), pagination.
- Answers: add, edit, delete, accept one as solution, vote. When you delete your account, your answers are removed and questions that had your answer accepted go back to “open”.
- Tags: attach to questions, filter by tag, page with popular tags.
- Profile: stats, edit username/email/phone, change password, delete account.
- Moderators: ban/unban users, edit or delete any question/answer.
- 404 and error boundary so the app doesn’t white-screen on bad routes or React errors.
- Toasts for success/error on main actions.

## Repo layout

```
ForumAppBackend/   – Spring Boot API
ForumAppFrontend/  – React SPA
```

Portfolio project.
