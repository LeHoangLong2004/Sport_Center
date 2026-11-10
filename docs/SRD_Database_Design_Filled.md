### 1. Database Schema

#### Table Description

| No | Table | Description |
| :--- | :--- | :--- |
| 1 | **roles** | Stores user access roles and permissions (Admin, Manager, Coach, Receptionist, Member). |
| 2 | **users** | Stores master account profiles, contact details, authentication credentials, and fitness goals. |
| 3 | **body_metrics** | Tracks biometric and physical measurements (height, weight, BMI, body fat percentage) of members. |
| 4 | **member_wallet_balances** | Maintains the current digital prepaid wallet balance for each member account. |
| 5 | **wallet_transactions** | Logs all financial deposits, withdrawals, and payments executed through the member wallet. |
| 6 | **sports** | Stores master catalog of sports and workout disciplines offered by the sports center (Gym, Yoga, Boxing, etc.). |
| 7 | **facilities** | Stores sports center branches, addresses, contact hotlines, and facility operating statuses. |
| 8 | **products** | Stores inventory catalog of retail sports goods, beverages, and fitness supplements for sale. |
| 9 | **packages** | Defines membership packages, pricing tiers (monthly/yearly), duration, and package types. |
| 10 | **package_features** | Defines itemized feature entitlements included or excluded in each membership package. |
| 11 | **package_sports** | Junction entity linking membership packages to the specific sports they grant access to. |
| 12 | **membership_benefits** | Stores detailed descriptions of exclusive privileges and benefits per package. |
| 13 | **subscriptions** | Stores member purchased package contracts, active date ranges, and billing statuses. |
| 14 | **subscription_sports** | Maps individual member subscriptions to specific sport disciplines covered under the plan. |
| 15 | **coaches** | Stores coach employment records, ratings, biographical summaries, and operational statuses. |
| 16 | **coach_profiles** | Stores extended coach credentials, certifications, specializations, and years of experience. |
| 17 | **coach_sports** | Junction entity mapping coaches to sports disciplines they are certified to instruct. |
| 18 | **coach_availability_slots** | Maintains open, reserved, or blocked coaching availability time slots for member booking. |
| 19 | **coach_schedule_requests** | Manages schedule modification, leave, and substitute coach requests submitted by coaches. |
| 20 | **coach_assessments** | Stores formal coach evaluations, ratings, feedback, and assigned homework for members. |
| 21 | **classes** | Maintains scheduled sport and fitness group classes, instructors, capacity, and rooms. |
| 22 | **class_bookings** | Records member reservations and booking confirmations for scheduled fitness classes. |
| 23 | **class_attendance_sheets** | Maintains master class attendance session summaries finalized by coaches/staff. |
| 24 | **class_attendance_records** | Tracks individual member check-in and attendance status for each class session. |
| 25 | **appointments** | Manages 1-on-1 personal training or consultation appointments between members and staff/coaches. |
| 26 | **check_in_logs** | Maintains access check-in history of members at turnstiles and facility front desks. |
| 27 | **gate_checkins** | Logs automated smart-gate entry check-ins validated against member packages. |
| 28 | **workout_plans** | Stores structured AI and coach-designed workout regimens, targets, and approval statuses. |
| 29 | **workout_plan_exercises** | Itemizes exercise routines, sets, reps, rest intervals, and target muscle groups in workout plans. |
| 30 | **communications** | Stores announcements, advisories, and workout assignments published by coaches/system. |
| 31 | **homework_progress** | Tracks member homework submission, completion percentage, and coach reviews. |
| 32 | **invoices** | Stores billing statements, order totals, payment methods, and financial statuses for services and goods. |
| 33 | **invoice_items** | Itemizes products and services included in each customer invoice. |
| 34 | **product_order_messages** | Stores communication thread and notes between customers and staff regarding specific orders. |
| 35 | **reviews** | Stores member ratings, testimonials, and feedback for coaches and completed training sessions. |
| 36 | **notifications** | Stores system and direct notifications pushed to users across the platform. |
| 37 | **chat_conversations** | Manages direct and support chat thread channels between members, coaches, and staff. |
| 38 | **chat_messages** | Stores timestamped chat messages and interactions exchanged within conversations. |

---

### 2. Table Detail

#### << Table 1: roles >>
*Stores user access roles and permissions (Admin, Manager, Coach, Receptionist, Member).*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `name` | VARCHAR | 50 | Yes | Yes | - | - |
| 3 | `description` | TEXT | - | No | No | - | - |


#### << Table 2: users >>
*Stores master account profiles, contact details, authentication credentials, and fitness goals.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `role_id` | UUID | - | No | No | FK | References roles(id) |
| 3 | `full_name` | TEXT | - | No | Yes | - | - |
| 4 | `phone_number` | VARCHAR | 20 | Yes | Yes | - | - |
| 5 | `email` | VARCHAR | 100 | Yes | Yes | - | - |
| 6 | `password_hash` | TEXT | - | No | Yes | - | - |
| 7 | `avatar_url` | TEXT | - | No | No | - | - |
| 8 | `date_of_birth` | DATE | - | No | No | - | - |
| 9 | `gender` | VARCHAR | 20 | No | No | - | - |
| 10 | `emergency_contact` | TEXT | - | No | No | - | - |
| 11 | `status` | BOOLEAN | - | No | No | - | Default: true |
| 12 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 13 | `member_code` | VARCHAR | 50 | Yes | No | - | - |
| 14 | `training_goal` | TEXT | - | No | No | - | - |
| 15 | `training_level` | VARCHAR | 50 | No | No | - | - |
| 16 | `address` | TEXT | - | No | No | - | - |


#### << Table 3: body_metrics >>
*Tracks biometric and physical measurements (height, weight, BMI, body fat percentage) of members.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 3 | `weight` | NUMERIC | - | No | No | - | - |
| 4 | `height` | NUMERIC | - | No | No | - | - |
| 5 | `body_fat` | NUMERIC | - | No | No | - | - |
| 6 | `muscle_mass` | NUMERIC | - | No | No | - | - |
| 7 | `bmi` | NUMERIC | - | No | No | - | - |
| 8 | `recorded_at` | TIMESTAMPTZ | - | No | No | - | Default current time |


#### << Table 4: member_wallet_balances >>
*Maintains the current digital prepaid wallet balance for each member account.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `user_id` | UUID | - | Yes | Yes | PK, FK | Primary key; References users(id) |
| 2 | `balance` | NUMERIC | - | No | Yes | - | Default: 0.00 |
| 3 | `last_updated_at` | TIMESTAMPTZ | - | No | No | - | Default current time |


#### << Table 5: wallet_transactions >>
*Logs all financial deposits, withdrawals, and payments executed through the member wallet.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | Yes | FK | References users(id) |
| 3 | `type` | VARCHAR | 20 | No | Yes | - | - |
| 4 | `amount` | NUMERIC | - | No | Yes | - | - |
| 5 | `balance_after` | NUMERIC | - | No | Yes | - | Default: 0.00 |
| 6 | `method` | VARCHAR | 50 | No | No | - | Default: 'VietQR' |
| 7 | `status` | VARCHAR | 20 | No | Yes | - | Default: 'completed' |
| 8 | `reference_code` | VARCHAR | 100 | Yes | No | - | - |
| 9 | `note` | TEXT | - | No | No | - | - |
| 10 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |


#### << Table 6: sports >>
*Stores master catalog of sports and workout disciplines offered by the sports center (Gym, Yoga, Boxing, etc.).*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `name` | TEXT | - | No | Yes | - | - |
| 3 | `description` | TEXT | - | No | No | - | - |
| 4 | `image_url` | TEXT | - | No | No | - | - |
| 5 | `status` | BOOLEAN | - | No | No | - | Default: true |


#### << Table 7: facilities >>
*Stores sports center branches, addresses, contact hotlines, and facility operating statuses.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `name` | TEXT | - | No | Yes | - | - |
| 3 | `address` | TEXT | - | No | Yes | - | - |
| 4 | `hotline` | VARCHAR | 20 | No | No | - | - |
| 5 | `status` | BOOLEAN | - | No | No | - | Default: true |
| 6 | `image_url` | TEXT | - | No | No | - | - |


#### << Table 8: products >>
*Stores inventory catalog of retail sports goods, beverages, and fitness supplements for sale.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `name` | TEXT | - | No | Yes | - | - |
| 3 | `category` | VARCHAR | 100 | No | No | - | - |
| 4 | `price` | NUMERIC | - | No | Yes | - | - |
| 5 | `stock_quantity` | INT | - | No | No | - | Default: 0 |
| 6 | `image_url` | TEXT | - | No | No | - | - |
| 7 | `status` | BOOLEAN | - | No | No | - | Default: true |


#### << Table 9: packages >>
*Defines membership packages, pricing tiers (monthly/yearly), duration, and package types.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | VARCHAR | 50 | Yes | Yes | PK | Primary key |
| 2 | `name` | TEXT | - | No | Yes | - | - |
| 3 | `tagline` | TEXT | - | No | No | - | - |
| 4 | `package_type` | VARCHAR | 20 | No | Yes | - | Default: 'sport' |
| 5 | `monthly_price` | NUMERIC | - | No | No | - | - |
| 6 | `yearly_price` | NUMERIC | - | No | No | - | - |
| 7 | `description` | TEXT | - | No | No | - | - |
| 8 | `status` | BOOLEAN | - | No | No | - | Default: true |
| 9 | `catalog_json` | JSONB | - | No | No | - | - |


#### << Table 10: package_features >>
*Defines itemized feature entitlements included or excluded in each membership package.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `package_id` | VARCHAR | 50 | No | No | FK | References packages(id) |
| 3 | `feature_text` | TEXT | - | No | Yes | - | - |
| 4 | `is_highlighted` | BOOLEAN | - | No | No | - | Default: false |


#### << Table 11: package_sports >>
*Junction entity linking membership packages to the specific sports they grant access to.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `package_id` | VARCHAR | 50 | No | Yes | FK | References packages(id) |
| 3 | `sport_id` | UUID | - | No | Yes | FK | References sports(id) |


#### << Table 12: membership_benefits >>
*Stores detailed descriptions of exclusive privileges and benefits per package.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `package_id` | VARCHAR | 50 | No | No | FK | References packages(id) |
| 3 | `benefit_type` | VARCHAR | 50 | No | Yes | - | - |
| 4 | `benefit_value` | TEXT | - | No | No | - | - |
| 5 | `description` | TEXT | - | No | Yes | - | - |


#### << Table 13: subscriptions >>
*Stores member purchased package contracts, active date ranges, and billing statuses.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 3 | `package_id` | VARCHAR | 50 | No | No | FK | References packages(id) |
| 4 | `sport_id` | UUID | - | No | No | FK | References sports(id) |
| 5 | `facility_id` | UUID | - | No | No | FK | References facilities(id) |
| 6 | `billing_period` | VARCHAR | 20 | No | No | - | - |
| 7 | `total_amount` | NUMERIC | - | No | Yes | - | - |
| 8 | `payment_method` | VARCHAR | 50 | No | No | - | - |
| 9 | `payment_status` | VARCHAR | 50 | No | No | - | Default: 'pending' |
| 10 | `start_date` | DATE | - | No | Yes | - | - |
| 11 | `end_date` | DATE | - | No | Yes | - | - |
| 12 | `auto_renew` | BOOLEAN | - | No | No | - | Default: false |
| 13 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 14 | `duration_months` | INT | - | No | No | - | - |
| 15 | `discount_pct` | NUMERIC | - | No | Yes | - | Default: 0 |
| 16 | `discount_amount` | NUMERIC | - | No | Yes | - | Default: 0 |
| 17 | `package_snapshot_json` | JSONB | - | No | No | - | - |
| 18 | `paid_at` | TIMESTAMPTZ | - | No | No | - | - |


#### << Table 14: subscription_sports >>
*Maps individual member subscriptions to specific sport disciplines covered under the plan.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `subscription_id` | UUID | - | No | Yes | FK | References subscriptions(id) |
| 3 | `sport_id` | UUID | - | No | Yes | FK | References sports(id) |


#### << Table 15: coaches >>
*Stores coach employment records, ratings, biographical summaries, and operational statuses.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 3 | `specialty` | TEXT | - | No | No | - | - |
| 4 | `bio` | TEXT | - | No | No | - | - |
| 5 | `experience_years` | INT | - | No | No | - | - |
| 6 | `rating` | NUMERIC | - | No | No | - | Default: 0.00 |
| 7 | `status` | BOOLEAN | - | No | No | - | Default: true |


#### << Table 16: coach_profiles >>
*Stores extended coach credentials, certifications, specializations, and years of experience.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `user_id` | UUID | - | Yes | Yes | PK, FK | Primary key; References users(id) |
| 2 | `specialties` | TEXT | - | No | No | - | - |
| 3 | `certifications` | TEXT | - | No | No | - | - |
| 4 | `experience_years` | INT | - | No | No | - | - |
| 5 | `bio` | TEXT | - | No | No | - | - |


#### << Table 17: coach_sports >>
*Junction entity mapping coaches to sports disciplines they are certified to instruct.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `coach_id` | UUID | - | No | Yes | FK | References coaches(id) |
| 3 | `sport_id` | UUID | - | No | Yes | FK | References sports(id) |


#### << Table 18: coach_availability_slots >>
*Maintains open, reserved, or blocked coaching availability time slots for member booking.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `coach_id` | UUID | - | No | Yes | FK | References coaches(id) |
| 3 | `start_time` | TIMESTAMPTZ | - | No | Yes | - | - |
| 4 | `end_time` | TIMESTAMPTZ | - | No | Yes | - | - |
| 5 | `sport` | TEXT | - | No | Yes | - | - |
| 6 | `room` | TEXT | - | No | Yes | - | - |
| 7 | `note` | TEXT | - | No | No | - | - |
| 8 | `status` | VARCHAR | 20 | No | Yes | - | Default: 'open' |
| 9 | `booked_member_id` | UUID | - | No | No | - | - |
| 10 | `booked_member_name` | TEXT | - | No | No | - | - |
| 11 | `booked_member_phone` | VARCHAR | 30 | No | No | - | - |
| 12 | `goal` | TEXT | - | No | No | - | - |
| 13 | `created_at` | TIMESTAMPTZ | - | No | Yes | - | Default current time |


#### << Table 19: coach_schedule_requests >>
*Manages schedule modification, leave, and substitute coach requests submitted by coaches.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `coach_id` | UUID | - | No | Yes | FK | References coaches(id) |
| 3 | `session_id` | UUID | - | No | No | FK | References classes(id) |
| 4 | `request_type` | VARCHAR | 30 | No | Yes | - | - |
| 5 | `substitute_coach_id` | UUID | - | No | No | FK | References coaches(id) |
| 6 | `new_date` | DATE | - | No | No | - | - |
| 7 | `new_time` | VARCHAR | 50 | No | No | - | - |
| 8 | `reason` | TEXT | - | No | Yes | - | - |
| 9 | `status` | VARCHAR | 30 | No | Yes | - | Default: 'pending' |
| 10 | `manager_note` | TEXT | - | No | No | - | - |
| 11 | `created_at` | TIMESTAMPTZ | - | No | Yes | - | Default current time |
| 12 | `class_name` | VARCHAR | 255 | No | No | - | - |
| 13 | `session_time` | VARCHAR | 100 | No | No | - | - |
| 14 | `sport_name` | VARCHAR | 100 | No | No | - | - |
| 15 | `room_name` | VARCHAR | 100 | No | No | - | - |


#### << Table 20: coach_assessments >>
*Stores formal coach evaluations, ratings, feedback, and assigned homework for members.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `coach_id` | UUID | - | No | Yes | FK | References coaches(id) |
| 3 | `session_id` | UUID | - | No | No | FK | References classes(id) |
| 4 | `member_id` | UUID | - | No | Yes | FK | References users(id) |
| 5 | `completion` | INT | - | No | Yes | - | Default: 0 |
| 6 | `metrics_json` | JSONB | - | No | Yes | - | Default: '[]' |
| 7 | `comment` | TEXT | - | No | No | - | - |
| 8 | `next_step` | TEXT | - | No | No | - | - |
| 9 | `created_at` | TIMESTAMPTZ | - | No | Yes | - | Default current time |


#### << Table 21: classes >>
*Maintains scheduled sport and fitness group classes, instructors, capacity, and rooms.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `sport_id` | UUID | - | No | No | FK | References sports(id) |
| 3 | `coach_id` | UUID | - | No | No | FK | References coaches(id) |
| 4 | `facility_id` | UUID | - | No | No | FK | References facilities(id) |
| 5 | `class_name` | TEXT | - | No | Yes | - | - |
| 6 | `schedule_time` | TIMESTAMPTZ | - | No | Yes | - | - |
| 7 | `duration_minutes` | INT | - | No | No | - | Default: 60 |
| 8 | `capacity` | INT | - | No | Yes | - | - |
| 9 | `current_enrolled` | INT | - | No | No | - | Default: 0 |
| 10 | `status` | BOOLEAN | - | No | No | - | Default: true |
| 11 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 12 | `level` | VARCHAR | 50 | No | No | - | - |
| 13 | `room` | VARCHAR | 100 | No | No | - | - |
| 14 | `approval_status` | VARCHAR | 20 | No | Yes | - | Default: 'approved' |


#### << Table 22: class_bookings >>
*Records member reservations and booking confirmations for scheduled fitness classes.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 3 | `class_id` | UUID | - | No | No | FK | References classes(id) |
| 4 | `subscription_id` | UUID | - | No | No | FK | References subscriptions(id) |
| 5 | `status` | VARCHAR | 50 | No | No | - | Default: 'pending' |
| 6 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |


#### << Table 23: class_attendance_sheets >>
*Maintains master class attendance session summaries finalized by coaches/staff.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `session_id` | UUID | - | Yes | Yes | PK, FK | Primary key; References classes(id) |
| 2 | `state` | VARCHAR | 50 | No | No | - | Default: 'unmarked' |
| 3 | `version` | INT | - | No | No | - | Default: 1 |
| 4 | `finalized_by` | UUID | - | No | No | FK | References users(id) |
| 5 | `finalized_at` | TIMESTAMPTZ | - | No | No | - | - |
| 6 | `updated_at` | TIMESTAMPTZ | - | No | No | - | Default current time |


#### << Table 24: class_attendance_records >>
*Tracks individual member check-in and attendance status for each class session.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `session_id` | UUID | - | No | Yes | FK | References classes(id) |
| 3 | `member_id` | UUID | - | No | Yes | FK | References users(id) |
| 4 | `status` | VARCHAR | 50 | No | No | - | - |
| 5 | `note` | TEXT | - | No | No | - | - |
| 6 | `updated_at` | TIMESTAMPTZ | - | No | No | - | Default current time |


#### << Table 25: appointments >>
*Manages 1-on-1 personal training or consultation appointments between members and staff/coaches.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `time` | VARCHAR | 10 | No | Yes | - | - |
| 3 | `title` | TEXT | - | No | Yes | - | - |
| 4 | `customer_name` | TEXT | - | No | Yes | - | - |
| 5 | `coach_name` | TEXT | - | No | No | - | - |
| 6 | `status` | VARCHAR | 50 | No | No | - | Default: 'Đang chờ khách' |
| 7 | `date` | VARCHAR | 20 | No | No | - | - |


#### << Table 26: check_in_logs >>
*Maintains access check-in history of members at turnstiles and facility front desks.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 3 | `facility_id` | UUID | - | No | No | FK | References facilities(id) |
| 4 | `subscription_id` | UUID | - | No | No | FK | References subscriptions(id) |
| 5 | `check_in_time` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 6 | `check_out_time` | TIMESTAMPTZ | - | No | No | - | - |
| 7 | `method` | VARCHAR | 50 | No | No | - | Default: 'qr' |


#### << Table 27: gate_checkins >>
*Logs automated smart-gate entry check-ins validated against member packages.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `member_id` | UUID | - | No | Yes | - | - |
| 3 | `branch_id` | UUID | - | No | No | - | - |
| 4 | `member_package_id` | UUID | - | No | No | - | - |
| 5 | `check_in_time` | TIMESTAMPTZ | - | No | Yes | - | Default current time |
| 6 | `receptionist_id` | UUID | - | No | No | - | - |


#### << Table 28: workout_plans >>
*Stores structured AI and coach-designed workout regimens, targets, and approval statuses.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 3 | `coach_id` | UUID | - | No | No | FK | References coaches(id) |
| 4 | `plan_name` | TEXT | - | No | Yes | - | - |
| 5 | `description` | TEXT | - | No | No | - | - |
| 6 | `start_date` | DATE | - | No | No | - | - |
| 7 | `end_date` | DATE | - | No | No | - | - |
| 8 | `sport_id` | UUID | - | No | No | FK | References sports(id) |
| 9 | `goal` | TEXT | - | No | No | - | - |
| 10 | `level` | VARCHAR | 50 | No | No | - | - |
| 11 | `duration_minutes` | INT | - | No | No | - | - |
| 12 | `status` | VARCHAR | 50 | No | No | - | Default: 'draft' |
| 13 | `updated_at` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 14 | `version` | INT | - | No | No | - | Default: 1 |
| 15 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 16 | `source` | TEXT | - | No | Yes | - | Default: 'manual' |
| 17 | `parent_plan_id` | UUID | - | No | No | - | - |
| 18 | `recommendation_target_type` | TEXT | - | No | No | - | - |
| 19 | `recommendation_target_id` | UUID | - | No | No | - | - |
| 20 | `ai_metadata_json` | TEXT | - | No | No | - | - |
| 21 | `approved_at` | TIMESTAMPTZ | - | No | No | - | - |
| 22 | `approved_by` | UUID | - | No | No | - | - |
| 23 | `approval_note` | TEXT | - | No | No | - | - |
| 24 | `archived_at` | TIMESTAMPTZ | - | No | No | - | - |
| 25 | `archived_by` | UUID | - | No | No | - | - |


#### << Table 29: workout_plan_exercises >>
*Itemizes exercise routines, sets, reps, rest intervals, and target muscle groups in workout plans.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `plan_id` | UUID | - | No | No | FK | References workout_plans(id) |
| 3 | `name` | TEXT | - | No | Yes | - | - |
| 4 | `reps` | TEXT | - | No | No | - | - |
| 5 | `rest` | TEXT | - | No | No | - | - |
| 6 | `note` | TEXT | - | No | No | - | - |
| 7 | `sets` | TEXT | - | No | No | - | - |
| 8 | `duration` | TEXT | - | No | No | - | - |
| 9 | `exercise_order` | INT | - | No | Yes | - | Default: 0 |


#### << Table 30: communications >>
*Stores announcements, advisories, and workout assignments published by coaches/system.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 3 | `title` | TEXT | - | No | Yes | - | - |
| 4 | `message` | TEXT | - | No | No | - | - |
| 5 | `is_read` | BOOLEAN | - | No | No | - | Default: false |
| 6 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 7 | `type` | VARCHAR | 50 | No | No | - | Default: 'Thông báo' |
| 8 | `target_type` | VARCHAR | 20 | No | No | - | Default: 'member' |
| 9 | `target_id` | UUID | - | No | No | - | - |
| 10 | `deadline` | TIMESTAMPTZ | - | No | No | - | - |
| 11 | `coach_id` | UUID | - | No | No | FK | References coaches(id) |
| 12 | `state` | VARCHAR | 50 | No | No | - | Default: 'draft' |
| 13 | `published_at` | TIMESTAMPTZ | - | No | No | - | - |


#### << Table 31: homework_progress >>
*Tracks member homework submission, completion percentage, and coach reviews.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `communication_id` | UUID | - | No | No | FK | References communications(id) |
| 3 | `member_id` | UUID | - | No | Yes | FK | References users(id) |
| 4 | `status` | VARCHAR | 50 | No | No | - | Default: 'assigned' |
| 5 | `completed_at` | TIMESTAMPTZ | - | No | No | - | - |
| 6 | `plan_id` | UUID | - | No | No | FK | References workout_plans(id) |
| 7 | `assigned_by` | UUID | - | No | No | - | - |
| 8 | `progress_pct` | NUMERIC | - | No | No | - | Default: 0 |
| 9 | `assigned_date` | TIMESTAMPTZ | - | No | Yes | - | Default current time |
| 10 | `due_date` | TIMESTAMPTZ | - | No | No | - | - |
| 11 | `notes` | TEXT | - | No | No | - | - |
| 12 | `created_at` | TIMESTAMPTZ | - | No | Yes | - | Default current time |


#### << Table 32: invoices >>
*Stores billing statements, order totals, payment methods, and financial statuses for services and goods.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 3 | `created_by` | UUID | - | No | No | FK | References users(id) |
| 4 | `total_amount` | NUMERIC | - | No | Yes | - | - |
| 5 | `payment_method` | VARCHAR | 50 | No | No | - | - |
| 6 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 7 | `payment_status` | VARCHAR | 50 | No | No | - | Default: 'pending' |
| 8 | `facility_id` | UUID | - | No | No | FK | References facilities(id) |
| 9 | `paid_at` | TIMESTAMPTZ | - | No | No | - | - |
| 10 | `fulfillment_method` | VARCHAR | 50 | No | Yes | - | Default: 'counter_pickup' |
| 11 | `fulfillment_status` | VARCHAR | 50 | No | Yes | - | Default: 'pending' |
| 12 | `delivery_location` | TEXT | - | No | No | - | - |
| 13 | `assigned_to` | UUID | - | No | No | FK | References users(id) |
| 14 | `fulfilled_at` | TIMESTAMPTZ | - | No | No | - | - |


#### << Table 33: invoice_items >>
*Itemizes products and services included in each customer invoice.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `invoice_id` | UUID | - | No | No | FK | References invoices(id) |
| 3 | `product_id` | UUID | - | No | No | FK | References products(id) |
| 4 | `quantity` | INT | - | No | Yes | - | - |
| 5 | `unit_price` | NUMERIC | - | No | Yes | - | - |


#### << Table 34: product_order_messages >>
*Stores communication thread and notes between customers and staff regarding specific orders.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `invoice_id` | UUID | - | No | Yes | FK | References invoices(id) |
| 3 | `sender_id` | UUID | - | No | Yes | FK | References users(id) |
| 4 | `message` | TEXT | - | No | Yes | - | - |
| 5 | `created_at` | TIMESTAMPTZ | - | No | Yes | - | Default current time |


#### << Table 35: reviews >>
*Stores member ratings, testimonials, and feedback for coaches and completed training sessions.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 3 | `coach_id` | UUID | - | No | No | FK | References coaches(id) |
| 4 | `rating` | INT | - | No | No | - | - |
| 5 | `comment` | TEXT | - | No | No | - | - |
| 6 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 7 | `session_id` | TEXT | - | No | No | - | - |
| 8 | `session_name` | TEXT | - | No | No | - | - |
| 9 | `tags_json` | TEXT | - | No | No | - | - |


#### << Table 36: notifications >>
*Stores system and direct notifications pushed to users across the platform.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | UUID | - | Yes | Yes | PK | Primary key; Auto UUID |
| 2 | `sender_id` | UUID | - | No | No | FK | References coaches(id) |
| 3 | `user_id` | UUID | - | No | No | FK | References users(id) |
| 4 | `target_type` | VARCHAR | 20 | No | No | - | Default: 'member' |
| 5 | `target_id` | UUID | - | No | No | - | - |
| 6 | `type` | VARCHAR | 50 | No | No | - | Default: 'Thông báo' |
| 7 | `state` | VARCHAR | 20 | No | No | - | Default: 'published' |
| 8 | `title` | TEXT | - | No | Yes | - | - |
| 9 | `message` | TEXT | - | No | No | - | - |
| 10 | `deadline` | TIMESTAMPTZ | - | No | No | - | - |
| 11 | `is_read` | BOOLEAN | - | No | No | - | Default: false |
| 12 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |


#### << Table 37: chat_conversations >>
*Manages direct and support chat thread channels between members, coaches, and staff.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | VARCHAR | 100 | Yes | Yes | PK | Primary key |
| 2 | `type` | VARCHAR | 50 | No | Yes | - | Default: 'direct' |
| 3 | `coach_title` | VARCHAR | 255 | No | No | - | - |
| 4 | `coach_subtitle` | VARCHAR | 255 | No | No | - | - |
| 5 | `member_title` | VARCHAR | 255 | No | No | - | - |
| 6 | `member_subtitle` | VARCHAR | 255 | No | No | - | - |
| 7 | `avatar` | TEXT | - | No | No | - | - |
| 8 | `coach_avatar` | TEXT | - | No | No | - | - |
| 9 | `last_message` | TEXT | - | No | No | - | - |
| 10 | `last_time` | VARCHAR | 50 | No | No | - | - |
| 11 | `unread_count` | INT | - | No | No | - | Default: 0 |
| 12 | `online` | BOOLEAN | - | No | No | - | Default: true |
| 13 | `coach_id` | VARCHAR | 100 | No | No | - | - |
| 14 | `coach_name` | VARCHAR | 255 | No | No | - | - |
| 15 | `member_id` | VARCHAR | 100 | No | No | - | - |
| 16 | `member_name` | VARCHAR | 255 | No | No | - | - |
| 17 | `updated_at` | TIMESTAMPTZ | - | No | No | - | Default current time |
| 18 | `category` | VARCHAR | 50 | No | Yes | - | Default: 'coach' |
| 19 | `role_tag` | VARCHAR | 50 | No | Yes | - | Default: 'HLV' |
| 20 | `badge_color` | VARCHAR | 50 | No | Yes | - | Default: 'orange' |


#### << Table 38: chat_messages >>
*Stores timestamped chat messages and interactions exchanged within conversations.*

| # | Field name | Type | Size | Unique | Not Null | PK/FK | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `id` | VARCHAR | 100 | Yes | Yes | PK | Primary key |
| 2 | `conversation_id` | VARCHAR | 100 | No | No | FK | References chat_conversations(id) |
| 3 | `sender` | VARCHAR | 50 | No | Yes | - | - |
| 4 | `sender_name` | VARCHAR | 255 | No | No | - | - |
| 5 | `text` | TEXT | - | No | Yes | - | - |
| 6 | `timestamp` | VARCHAR | 50 | No | Yes | - | - |
| 7 | `created_at` | TIMESTAMPTZ | - | No | No | - | Default current time |

