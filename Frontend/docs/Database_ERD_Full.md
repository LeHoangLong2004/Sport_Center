```mermaid
erDiagram
    roles {
        uuid id PK
        varchar name UK
        text description
    }

    users {
        uuid id PK
        uuid role_id FK
        text full_name
        varchar phone_number UK
        varchar email UK
        text password_hash
        text avatar_url
        date date_of_birth
        varchar gender
        text emergency_contact
        boolean status
        timestamptz created_at
        varchar member_code UK
        text training_goal
        varchar training_level
        text address
    }

    facilities {
        uuid id PK
        text name
        text address
        varchar hotline
        boolean status
    }

    sports {
        uuid id PK
        text name
        text description
        text image_url
        boolean status
    }

    packages {
        varchar id PK
        text name
        text tagline
        varchar package_type
        numeric monthly_price
        numeric yearly_price
        text description
        boolean status
        jsonb catalog_json
    }

    package_features {
        uuid id PK
        varchar package_id FK
        text feature_text
        boolean is_highlighted
    }

    package_sports {
        uuid id PK
        varchar package_id FK
        uuid sport_id FK
    }

    membership_benefits {
        uuid id PK
        varchar package_id FK
        varchar benefit_type
        text benefit_value
        text description
    }

    vouchers {
        uuid id PK
        varchar code UK
        numeric discount_percent
        numeric max_discount
        timestamptz valid_from
        timestamptz valid_to
        integer usage_limit
        integer used_count
        boolean status
    }

    subscriptions {
        uuid id PK
        uuid user_id FK
        varchar package_id FK
        uuid sport_id FK
        uuid facility_id FK
        uuid voucher_id FK
        varchar billing_period
        numeric total_amount
        varchar payment_method
        varchar payment_status
        date start_date
        date end_date
        boolean auto_renew
        timestamptz created_at
        integer duration_months
        numeric discount_pct
        numeric discount_amount
        jsonb package_snapshot_json
        timestamptz paid_at
    }

    communications {
        uuid id PK
        uuid user_id FK
        text title
        text message
        boolean is_read
        timestamptz created_at
        varchar type
        varchar target_type
        uuid target_id
        timestamptz deadline
        uuid coach_id FK
        varchar state
        timestamptz published_at
    }

    check_in_logs {
        uuid id PK
        uuid user_id FK
        uuid facility_id FK
        uuid subscription_id FK
        timestamptz check_in_time
        timestamptz check_out_time
        varchar method
    }

    coaches {
        uuid id PK
        uuid user_id FK, UK
        text specialty
        text bio
        integer experience_years
        numeric rating
        boolean status
    }

    coach_sports {
        uuid id PK
        uuid coach_id FK
        uuid sport_id FK
    }

    pt_packages {
        uuid id PK
        text name
        integer session_count
        numeric price
        integer validity_days
        boolean status
    }

    pt_enrollments {
        uuid id PK
        uuid user_id FK
        uuid coach_id FK
        uuid pt_package_id FK
        uuid voucher_id FK
        integer total_sessions
        integer used_sessions
        varchar payment_method
        varchar payment_status
        numeric total_amount
        numeric discount_amount
        date start_date
        date end_date
        timestamptz created_at
    }

    pt_sessions {
        uuid id PK
        uuid enrollment_id FK
        timestamptz schedule_time
        integer duration_minutes
        varchar status
        text notes
        timestamptz created_at
    }

    reviews {
        uuid id PK
        uuid user_id FK
        uuid coach_id FK
        integer rating
        text comment
        timestamptz created_at
    }

    classes {
        uuid id PK
        uuid sport_id FK
        uuid coach_id FK
        uuid facility_id FK
        text class_name
        timestamptz schedule_time
        integer duration_minutes
        integer capacity
        integer current_enrolled
        boolean status
        timestamptz created_at
        varchar level
        varchar room
    }

    class_bookings {
        uuid id PK
        uuid user_id FK
        uuid class_id FK
        uuid subscription_id FK
        varchar status
        timestamptz created_at
    }

    body_metrics {
        uuid id PK
        uuid user_id FK
        numeric weight
        numeric height
        numeric body_fat
        numeric muscle_mass
        numeric bmi
        timestamptz recorded_at
    }

    workout_plans {
        uuid id PK
        uuid user_id FK
        uuid coach_id FK
        text plan_name
        text description
        date start_date
        date end_date
        uuid sport_id FK
        text goal
        varchar level
        integer duration_minutes
        varchar status
        timestamptz updated_at
        integer version
    }

    diet_plans {
        uuid id PK
        uuid user_id FK
        uuid coach_id FK
        integer calories_target
        text meals_description
        timestamptz created_at
    }

    products {
        uuid id PK
        text name
        varchar category
        numeric price
        integer stock_quantity
        text image_url
        boolean status
    }

    invoices {
        uuid id PK
        uuid user_id FK
        uuid created_by FK
        numeric total_amount
        varchar payment_method
        timestamptz created_at
        varchar payment_status
        uuid facility_id FK
        timestamptz paid_at
        varchar fulfillment_method
        varchar fulfillment_status
        text delivery_location
        uuid assigned_to FK
        timestamptz fulfilled_at
    }

    invoice_items {
        uuid id PK
        uuid invoice_id FK
        uuid product_id FK
        integer quantity
        numeric unit_price
    }

    product_order_messages {
        uuid id PK
        uuid invoice_id FK
        uuid sender_id FK
        text message
        timestamptz created_at
    }

    article_categories {
        uuid id PK
        text name
        text description
    }

    articles {
        uuid id PK
        uuid category_id FK
        uuid author_id FK
        text title
        text thumbnail_url
        text content
        varchar status
        timestamptz published_at
    }

    contact_messages {
        uuid id PK
        text sender_name
        varchar sender_email
        varchar sender_phone
        text message
        boolean is_resolved
        timestamptz created_at
    }

    workout_plan_exercises {
        uuid id PK
        uuid plan_id FK
        text name
        text reps
        text rest
        text note
    }

    workout_plan_assignments {
        uuid id PK
        uuid plan_id FK
        varchar target_type
        uuid target_id
        timestamptz assigned_at
    }

    class_attendance_sheets {
        uuid session_id PK, FK
        varchar state
        integer version
        uuid finalized_by FK
        timestamptz finalized_at
        timestamptz updated_at
    }

    class_attendance_records {
        uuid id PK
        uuid session_id FK
        uuid member_id FK
        varchar status
        text note
        timestamptz updated_at
    }

    class_attendance_audits {
        uuid id PK
        uuid session_id FK
        uuid actor_id FK
        varchar action
        text reason
        jsonb changes
        timestamptz occurred_at
    }

    training_results {
        uuid id PK
        uuid session_id FK
        uuid member_id FK
        uuid coach_id FK
        text metric_name
        numeric value
        varchar unit
        integer effort
        text comment
        varchar visibility
        timestamptz recorded_at
    }

    homework_progress {
        uuid id PK
        uuid communication_id FK
        uuid member_id FK
        varchar status
        timestamptz completed_at
    }

    %% Alias cho public."__EFMigrationsHistory"
    ef_migrations_history {
        varchar MigrationId PK
        varchar ProductVersion
    }

    coach_profiles {
        uuid user_id PK, FK
        text specialties
        text certifications
        integer experience_years
        text bio
    }

    appointments {
        uuid id PK
        varchar time
        text title
        text customer_name
        varchar coach_name
        varchar status
    }

    subscription_sports {
        uuid id PK
        uuid subscription_id FK
        uuid sport_id FK
    }

    chat_conversations {
        varchar id PK
        varchar type
        varchar coach_title
        varchar coach_subtitle
        varchar member_title
        varchar member_subtitle
        text avatar
        text coach_avatar
        text last_message
        varchar last_time
        integer unread_count
        boolean online
        varchar coach_id
        varchar coach_name
        varchar member_id
        varchar member_name
        timestamptz updated_at
    }

    chat_messages {
        varchar id PK
        varchar conversation_id FK
        varchar sender
        varchar sender_name
        text text
        varchar timestamp
        timestamptz created_at
    }

    gate_checkins {
        uuid id PK
        uuid member_id
        uuid branch_id
        uuid member_package_id
        timestamptz check_in_time
        uuid receptionist_id
    }

    roles ||--o{ users : role_id

    users ||--o{ subscriptions : user_id
    users ||--o{ communications : user_id
    users ||--o{ check_in_logs : user_id
    users ||--o{ pt_enrollments : user_id
    users ||--o{ reviews : user_id
    users ||--o{ class_bookings : user_id
    users ||--o{ body_metrics : user_id
    users ||--o{ workout_plans : user_id
    users ||--o{ diet_plans : user_id
    users ||--o{ invoices : user_id
    users ||--o{ invoices : created_by
    users ||--o{ invoices : assigned_to
    users ||--o{ product_order_messages : sender_id
    users ||--o{ articles : author_id
    users ||--o{ class_attendance_sheets : finalized_by
    users ||--o{ class_attendance_records : member_id
    users ||--o{ class_attendance_audits : actor_id
    users ||--o{ training_results : member_id
    users ||--o{ homework_progress : member_id
    users ||--o| coaches : user_id
    users ||--o| coach_profiles : user_id

    facilities ||--o{ classes : facility_id
    facilities ||--o{ invoices : facility_id
    facilities ||--o{ check_in_logs : facility_id
    facilities ||--o{ subscriptions : facility_id

    sports ||--o{ package_sports : sport_id
    sports ||--o{ workout_plans : sport_id
    sports ||--o{ subscription_sports : sport_id
    sports ||--o{ subscriptions : sport_id
    sports ||--o{ coach_sports : sport_id
    sports ||--o{ classes : sport_id

    packages ||--o{ package_sports : package_id
    packages ||--o{ package_features : package_id
    packages ||--o{ membership_benefits : package_id
    packages ||--o{ subscriptions : package_id

    vouchers ||--o{ pt_enrollments : voucher_id
    vouchers ||--o{ subscriptions : voucher_id

    subscriptions ||--o{ subscription_sports : subscription_id
    subscriptions ||--o{ class_bookings : subscription_id
    subscriptions ||--o{ check_in_logs : subscription_id

    coaches ||--o{ coach_sports : coach_id
    coaches ||--o{ classes : coach_id
    coaches ||--o{ pt_enrollments : coach_id
    coaches ||--o{ reviews : coach_id
    coaches ||--o{ workout_plans : coach_id
    coaches ||--o{ diet_plans : coach_id
    coaches ||--o{ communications : coach_id
    coaches ||--o{ training_results : coach_id

    pt_packages ||--o{ pt_enrollments : pt_package_id
    pt_enrollments ||--o{ pt_sessions : enrollment_id

    classes ||--o{ class_bookings : class_id
    classes ||--o| class_attendance_sheets : session_id
    classes ||--o{ class_attendance_records : session_id
    classes ||--o{ class_attendance_audits : session_id
    classes ||--o{ training_results : session_id

    workout_plans ||--o{ workout_plan_exercises : plan_id
    workout_plans ||--o{ workout_plan_assignments : plan_id

    products ||--o{ invoice_items : product_id
    invoices ||--o{ invoice_items : invoice_id
    invoices ||--o{ product_order_messages : invoice_id

    article_categories ||--o{ articles : category_id

    communications ||--o{ homework_progress : communication_id

    chat_conversations ||--o{ chat_messages : conversation_id

