# Total Project Tracking

*Information in the columns A-E are filled in the project initiation; columns F-J to be filled during development.*

| # | Screen/Function | Feature | Actor | Description | Complexity | In Charge | Status | Update Details |
|---|---|---|---|---|---|---|---|---|
| **1** | **User Login/Register** | **Auth** | All | This is a feature for user authentication including JWT login, register, and password recovery | Medium | Phương | Done | Set up EF Core with Supabase, JWT Authentication, configured Swagger, and fixed DB connection timeout issue |
| **2** | **Account & Role Management** | **User & Role** | Manager | This is a feature to manage the user list and set up roles (RBAC) for staff | Medium | Phương | Done | Initialized User schemas, integrated Repository Pattern, implemented CRUD APIs and strict RBAC Authorization |
| **3** | **Package Management** | **Membership** | Manager | This is a feature for CRUD operations on packages, sports, and member benefits | Complex | Phương | Done | Created Package Entity, Repository, Service, and Endpoints for Package CRUD |
| **4** | **Purchase / Renew Package** | **Membership** | Member, Receptionist | This is a feature allowing members to buy packages online or receptionists to sell them at the counter | Complex | Phương | Done | Built Subscription flow, Subscription APIs, linked Packages with Subscriptions |
| **5** | **Admin Dashboard - Remove Mock Data** | **UI/UX** | Manager | This is a feature to clean up the hardcoded KPI values and mock data from the Admin Dashboard views in preparation for API integration. | Easy | Phương | Done | Removed all static numbers and initialized data arrays to empty across Overview, Finance, HR, and Schedule pages |
| **6** | **Admin Dashboard - Connect Flow 1 CRUD** | **Frontend** | Manager | This is a feature to connect frontend dashboard with Flow 1 Backend APIs (Users, Packages). | Medium | Phương | Done | Completed CRUD integration for Members (Toggle Status, View Profile) and Packages (Create, Delete) with API. |
| **7** | **Dynamic User Profiles & Avatars** | **Frontend** | All | Remove hardcoded names/avatars across all portals, implement Gmail-style fallback avatars, and refactor Coach profile routing. | Easy | Phương | Done | Implemented UserAvatar fallback, synced sidebar info with localStorage, extracted CoachSettings screen. |
