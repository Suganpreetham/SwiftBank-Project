# SwiftBank

A distributed banking platform I built to learn how real backend systems work — not just CRUD, but actual microservices talking to each other through events, with real problems like race conditions, duplicate requests, and cache consistency.

🌐 [Live Frontend](I will add in few hours--06/06/2026 afternoon)

## What is this?

SwiftBank is a backend system that works like a real bank — users can register, open accounts, deposit money, and transfer between his accounts. Behind the scenes, every transfer triggers a fraud check and a notification, all happening asynchronously through Apache Kafka.

I built this because I wanted to understand how large systems handle things like:
- What happens if the same transfer request is sent twice?
- How do you keep a cached balance in sync with the database?
- How do fraud detection and notifications work without slowing down the actual transaction?


## Architecture

6 independent services, each with its own database, communicating through Kafka:
Browser -> API Gateway (8080)
1. User Service (8081)        -> PostgreSQL (user_db
2. Account Service (8082)     -> PostgreSQL (account_db) + Redis
3. Transaction Service (8083) -> PostgreSQL (transaction_db)
4. Kafka (transaction.completed)
5. Fraud Service (8084)       -> PostgreSQL (fraud_db)
6. Notification Service (8085)

## Tech Stack

**Technology**
1. Language : Java 17 
2. Framework : Spring Boot 3.3 
3. API Gateway : Spring Cloud Gateway 
4. Auth : Spring Security + JWT 
5. Messaging : Apache Kafka (KRaft — no Zookeeper) 
6. Cache : Redis 
7. Database : PostgreSQL (one per service) 
8. Frontend : React + Vite 
9. Infrastructure : Docker + Docker Compose 


**Services**

### API Gateway — port 8080
Entry point for all requests. Validates JWT tokens before forwarding to any service. If the token is missing or expired, the request is rejected here and the other services never see it.

### User Service — port 8081
This handles registration and login. Passwords are hashed with BCrypt before storing — the plain text password is never stored the database. Returns a JWT token on successful login.

### Account Service — port 8082
To create and manage bank accounts. Balance reads are cached in Redis — repeated balance checks don't fetch the database. When a balance changes, the cache is removed as it is old data now.

### Transaction Service — port 8083
The most important service. Handles deposits and transfers with two things:

**Idempotency** — every transfer has a unique key. If the same request arrives twice (network retry, accidental double click), it returns the original result without processing again. No double-spending or double-deposits.
 
**Atomicity** — the debit and credit happen inside a single Transactional block. If the credit fails after the debit, both roll back, so there is no "money debited but not received" problem.

After every transaction, it publishes a **transaction.completed** event to Kafka. It doesn't wait for fraud checks or notifications.

### Fraud Detection Service — port 8084
Listens to Kafka. For every transaction event it runs three things:
- Amount over ₹10,000 → noticed
- 3 or more transactions from the same account in 60 seconds → velocity breach
- Round amount over ₹5,000 (divisible by 1000) → suspicious

It has its own database. Saves alerts to its own database. Completely independent of the transaction — a fraud service crash doesn't affect transfers.

### Notification Service — port 8085
This also listens to Kafka. Logs a formatted notification for every transaction. In a real system this would send emails or SMS but here it shows that multiple consumers can independently react to the same event.


## Things I learned building this

**Database-per-service is harder than it sounds.** When Transaction Service needs to update a balance, it can't directly touch Account Service's database. It has to go through the API. This forced me to think about what happens when that API call fails mid-transfer.

**Kafka changed how I think about systems.** Before this, my idea was to call services directly. With Kafka, Transaction Service doesn't care if Fraud Service is down. It starts an event and completes its work. The consumer catches up when it restarts.

**Cache invalidation is a real problem.** Early in development, balances were showing wrong values because Redis was showing old data. The fix was Cache romoval on every balance write — butwe have to do in order(write DB first, then remove cache) but it took some debugging time.

**Idempotency saved me during testing.** I accidentally hit the transfer button multiple times and money was disappearing. Adding the idempotency key check fixed it immediately and made me understand why every payment system in the world uses this.


## Running the Project

1. Start infrastructure

-docker-compose up postgres redis kafka -d

2. Start each service
Open each folder in IntelliJ and run.

### 3. Start frontend

cd frontend
npm install
npm run dev

And done.... just open the given link http://localhost:5173  given when u run frontend.
