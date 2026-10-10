```mermaid
erDiagram
    roles {
        UUID id PK
        VARCHAR(50) name 
        TEXT description 
    }

    users {
        UUID id PK
        UUID role_id FK
        VARCHAR(50) member_code 
        TEXT full_name 
        VARCHAR(20) phone_number 
        VARCHAR(100) email 
        TEXT password_hash 
        TEXT avatar_url 
        DATE date_of_birth D
        VARCHAR(20) gender 
        TEXT emergency_contact 
        TEXT training_goal 
        VARCHAR(50) training_level 
        BOOLEAN status 
        TIMESTAMPTZ created_at 
    }

    facilities {
        UUID id PK
        TEXT name 
        TEXT address 
        VARCHAR(20) hotline 
        BOOLEAN status 
    }

    sports {
        UUID id PK
        TEXT name 
        TEXT description 
        TEXT image_url 
        BOOLEAN status 
    }

    packages {
        VARCHAR(50) id PK
        TEXT name 
        TEXT tagline 
        VARCHAR(20) package_type 
        DECIMAL(182) monthly_price 
        DECIMAL(182) yearly_price 
        TEXT description 
        BOOLEAN status 
    }

    package_features {
        UUID id PK
        VARCHAR(50) package_id FK
        TEXT feature_text 
        BOOLEAN is_highlighted 
    }

    package_sports {
        UUID id PK
        VARCHAR(50) package_id FK
        UUID sport_id FK
    }

    membership_benefits {
        UUID id PK
        VARCHAR(50) package_id FK
        VARCHAR(50) benefit_type 
        TEXT benefit_value 
        TEXT description 
    }

    vouchers {
        UUID id PK
        VARCHAR(50) code 
        DECIMAL(52) discount_percent 
        DECIMAL(182) max_discount 
        TIMESTAMPTZ valid_from 
        TIMESTAMPTZ valid_to 
        INT usage_limit 
        INT used_count 
        BOOLEAN status 
    }

    subscriptions {
        UUID id PK
        UUID user_id FK
        VARCHAR(50) package_id FK
        UUID sport_id FK
        UUID facility_id FK
        UUID voucher_id FK
        VARCHAR(20) billing_period 
        DECIMAL(182) total_amount 
        VARCHAR(50) payment_method 
        VARCHAR(50) payment_status 
        DATE start_date 
        DATE end_date 
        BOOLEAN auto_renew 
        TIMESTAMPTZ created_at 
    }

    notifications {
        UUID id PK
        UUID sender_id FK
        UUID user_id FK
        VARCHAR(20) target_type 
        UUID target_id 
        VARCHAR(50) type 
        VARCHAR(20) state 
        TEXT title 
        TEXT message 
        TIMESTAMPTZ deadline 
        BOOLEAN is_read 
        TIMESTAMPTZ created_at 
    }

    check_in_logs {
        UUID id PK
        UUID user_id FK
        UUID facility_id FK
        UUID subscription_id FK
        TIMESTAMPTZ check_in_time 
        TIMESTAMPTZ check_out_time 
        VARCHAR(50) method 
    }

    coaches {
        UUID id PK
        UUID user_id FK
        TEXT specialty 
        TEXT bio 
        INT experience_years 
        DECIMAL(32) rating 
        BOOLEAN status 
    }

    coach_sports {
        UUID id PK
        UUID coach_id FK
        UUID sport_id FK
    }

    pt_packages {
        UUID id PK
        TEXT name 
        INT session_count 
        DECIMAL(182) price 
        INT validity_days 
        BOOLEAN status 
    }

    pt_enrollments {
        UUID id PK
        UUID user_id FK
        UUID coach_id FK
        UUID pt_package_id FK
        UUID voucher_id FK
        INT total_sessions 
        INT used_sessions 
        VARCHAR(50) payment_method 
        VARCHAR(50) payment_status 
        DECIMAL(182) total_amount 
        DECIMAL(182) discount_amount 
        DATE start_date 
        DATE end_date 
        TIMESTAMPTZ created_at 
    }

    pt_sessions {
        UUID id PK
        UUID enrollment_id FK
        TIMESTAMPTZ schedule_time 
        INT duration_minutes 
        VARCHAR(50) status 
        TEXT notes 
        TIMESTAMPTZ created_at 
    }

    reviews {
        UUID id PK
        UUID user_id FK
        UUID coach_id FK
        INT rating 
        TEXT comment 
        TIMESTAMPTZ created_at 
    }

    classes {
        UUID id PK
        UUID sport_id FK
        UUID coach_id FK
        UUID facility_id FK
        TEXT class_name 
        VARCHAR(50) level 
        VARCHAR(100) room 
        TIMESTAMPTZ schedule_time 
        INT duration_minutes 
        INT capacity 
        INT current_enrolled 
        BOOLEAN status 
        TIMESTAMPTZ created_at 
    }

    class_bookings {
        UUID id PK
        UUID user_id FK
        UUID class_id FK
        UUID subscription_id FK
        VARCHAR(50) status 
        TIMESTAMPTZ created_at 
    }

    body_metrics {
        UUID id PK
        UUID user_id FK
        DECIMAL(52) weight 
        DECIMAL(52) height 
        DECIMAL(52) body_fat 
        DECIMAL(52) muscle_mass 
        DECIMAL(52) bmi 
        TIMESTAMPTZ recorded_at 
    }

    workout_plans {
        UUID id PK
        UUID coach_id FK
        UUID sport_id FK
        TEXT plan_name 
        TEXT description 
        TEXT goal 
        VARCHAR(50) level 
        INT duration_minutes 
        VARCHAR(50) status 
        INT version 
        TIMESTAMPTZ created_at 
        TIMESTAMPTZ updated_at 
    }

    workout_plan_exercises {
        UUID id PK
        UUID plan_id FK
        TEXT name 
        TEXT reps 
        TEXT rest 
        TEXT note 
    }

    workout_plan_assignments {
        UUID id PK
        UUID plan_id FK
        VARCHAR(20) target_type 
        UUID target_id 
        TIMESTAMPTZ assigned_at 
    }

    diet_plans {
        UUID id PK
        UUID user_id FK
        UUID coach_id FK
        INT calories_target 
        TEXT meals_description 
        TIMESTAMPTZ created_at 
    }

    products {
        UUID id PK
        TEXT name 
        VARCHAR(100) category 
        DECIMAL(182) price 
        INT stock_quantity 
        TEXT image_url 
        BOOLEAN status 
    }

    invoices {
        UUID id PK
        UUID user_id FK
        UUID created_by FK
        UUID facility_id FK
        DECIMAL(182) total_amount 
        VARCHAR(50) payment_method 
        VARCHAR(50) payment_status 
        TIMESTAMPTZ created_at 
        TIMESTAMPTZ paid_at 
    }

    invoice_items {
        UUID id PK
        UUID invoice_id FK
        UUID product_id FK
        INT quantity 
        DECIMAL(182) unit_price 
    }

    article_categories {
        UUID id PK
        TEXT name 
        TEXT description 
    }

    articles {
        UUID id PK
        UUID category_id FK
        UUID author_id FK
        TEXT title 
        TEXT thumbnail_url 
        TEXT content 
        VARCHAR(50) status 
        TIMESTAMPTZ published_at 
    }

    contact_messages {
        UUID id PK
        TEXT sender_name 
        VARCHAR(100) sender_email 
        VARCHAR(20) sender_phone 
        TEXT message 
        BOOLEAN is_resolved 
        TIMESTAMPTZ created_at 
    }

    class_attendance_sheets {
        UUID session_id PK
        VARCHAR(20) state 
        INT version 
        TIMESTAMPTZ finalized_at 
        UUID finalized_by FK
        TIMESTAMPTZ created_at 
        TIMESTAMPTZ updated_at 
    }

    class_attendance_records {
        UUID session_id FK
        UUID member_id FK
        VARCHAR(20) status 
        TEXT note 
    }

    class_attendance_audits {
        UUID id PK
        UUID session_id FK
        UUID actor_id FK
        VARCHAR(50) action 
        TEXT reason 
        JSONB changes 
        TIMESTAMPTZ occurred_at 
    }

    training_results {
        UUID id PK
        UUID session_id FK
        UUID member_id FK
        UUID coach_id FK
        TEXT metric_name 
        DECIMAL(102) value 
        VARCHAR(20) unit 
        INT effort 
        TEXT comment 
        VARCHAR(20) visibility 
        TIMESTAMPTZ recorded_at 
    }

    homework_progress {
        UUID notification_id FK
        UUID member_id FK
        VARCHAR(20) status 
        TIMESTAMPTZ completed_at 
    }

    %% Relationships
    article_categories ||--o{ articles : "category_id"
    classes ||--o{ class_attendance_audits : "session_id"
    classes ||--o{ class_attendance_records : "session_id"
    classes ||--o{ class_attendance_sheets : "session_id"
    classes ||--o{ class_bookings : "class_id"
    classes ||--o{ training_results : "session_id"
    coaches ||--o{ classes : "coach_id"
    coaches ||--o{ coach_sports : "coach_id"
    coaches ||--o{ diet_plans : "coach_id"
    coaches ||--o{ notifications : "sender_id"
    coaches ||--o{ pt_enrollments : "coach_id"
    coaches ||--o{ reviews : "coach_id"
    coaches ||--o{ training_results : "coach_id"
    coaches ||--o{ workout_plans : "coach_id"
    facilities ||--o{ check_in_logs : "facility_id"
    facilities ||--o{ classes : "facility_id"
    facilities ||--o{ invoices : "facility_id"
    facilities ||--o{ subscriptions : "facility_id"
    invoices ||--o{ invoice_items : "invoice_id"
    notifications ||--o{ homework_progress : "notification_id"
    packages ||--o{ membership_benefits : "package_id"
    packages ||--o{ package_features : "package_id"
    packages ||--o{ package_sports : "package_id"
    packages ||--o{ subscriptions : "package_id"
    products ||--o{ invoice_items : "product_id"
    pt_enrollments ||--o{ pt_sessions : "enrollment_id"
    pt_packages ||--o{ pt_enrollments : "pt_package_id"
    roles ||--o{ users : "role_id"
    sports ||--o{ classes : "sport_id"
    sports ||--o{ coach_sports : "sport_id"
    sports ||--o{ package_sports : "sport_id"
    sports ||--o{ subscriptions : "sport_id"
    sports ||--o{ workout_plans : "sport_id"
    subscriptions ||--o{ check_in_logs : "subscription_id"
    subscriptions ||--o{ class_bookings : "subscription_id"
    users ||--o{ articles : "author_id"
    users ||--o{ body_metrics : "user_id"
    users ||--o{ check_in_logs : "user_id"
    users ||--o{ class_attendance_audits : "actor_id"
    users ||--o{ class_attendance_records : "member_id"
    users ||--o{ class_attendance_sheets : "finalized_by"
    users ||--o{ class_bookings : "user_id"
    users ||--o{ coaches : "user_id"
    users ||--o{ diet_plans : "user_id"
    users ||--o{ homework_progress : "member_id"
    users ||--o{ invoices : "created_by"
    users ||--o{ invoices : "user_id"
    users ||--o{ notifications : "user_id"
    users ||--o{ pt_enrollments : "user_id"
    users ||--o{ reviews : "user_id"
    users ||--o{ subscriptions : "user_id"
    users ||--o{ training_results : "member_id"
    vouchers ||--o{ pt_enrollments : "voucher_id"
    vouchers ||--o{ subscriptions : "voucher_id"
    workout_plans ||--o{ workout_plan_assignments : "plan_id"
    workout_plans ||--o{ workout_plan_exercises : "plan_id"
```
