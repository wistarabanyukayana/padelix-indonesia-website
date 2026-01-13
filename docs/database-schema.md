# Database Schema Documentation

## Domain 1: Role-Based Access Control (RBAC)
*Focus: Security, Authentication, and Authorization.*

### **Table: users**
*   **Description:** Stores user credentials and account status for administrative access to the system.
*   **Attributes:**
    *   `id`: unique primary identifier.
    *   `username`: Unique login name.
    *   `email`: Primary contact and unique identifier for communication.
    *   `password_hash`: Securely salted and hashed password string.
    *   `is_active`: Flag to enable or suspend account access.
    *   `last_login`: Timestamp of the most recent successful authentication.
    *   `created_at/updated_at`: Standard audit timestamps.

### **Table: roles**
*   **Description:** Defines groups of permissions (e.g., Admin, Editor, Viewer).
*   **Attributes:**
    *   `name`: Human-readable name of the role.
    *   `description`: Explanation of what users with this role can do.

### **Table: permissions**
*   **Description:** Granular capability tokens (e.g., `create_product`, `delete_portfolio`).
*   **Attributes:**
    *   `slug`: Unique machine-readable string for code-level checks (e.g., `im:product:write`).
    *   `description`: Context for what the specific permission allows.

### **Junction Tables:**
*   **users_roles:** Maps users to one or more roles (Many-to-Many).
*   **roles_permissions:** Maps roles to granular permissions (Many-to-Many).

---

## Domain 2: Inventory & Catalog Management (ICM)
*Focus: Product catalog, specifications, and variants.*

### **Table: products**
*   **Description:** The core catalog entity representing a saleable or displayable item.
*   **Attributes:**
    *   `name`: Commercial name of the product.
    *   `slug`: URL-friendly unique identifier.
    *   `description`: Detailed marketing text (HTML/Markdown supported).
    *   `base_price`: Starting price before variant adjustments.
    *   `show_price`: Flag to control whether the price is displayed on the public frontend.
    *   `is_active`: Controls visibility on the public frontend.
    *   `is_featured`: If true, the item appears in homepage highlights.
    *   `brand_id/category_id`: Foreign keys for organization.
    *   `created_by`: Reference to the user who added the product.

### **Table: product_variants**
*   **Description:** Specific versions of a product (e.g., different sizes or materials).
*   **Attributes:**
    *   `sku`: Stock Keeping Unit (Unique barcode/identifier).
    *   `price_adjustment`: Amount added to or subtracted from the product's base price.
    *   `stock_quantity`: Current inventory level.
    *   `is_unlimited_stock`: Flag for items that don't track physical inventory counts.

### **Table: product_images**
*   **Description:** Visual assets associated with a product.
*   **Attributes:**
    *   `image_url`: Absolute path to the image (Storage or Public).
    *   `is_primary`: If true, this is the main image used in thumbnails.
    *   `sort_order`: Controls the sequence in the image gallery.

### **Table: product_specifications**
*   **Description:** Flexible key-value pairs for technical data (e.g., "Weight": "10kg").

### **Table: brands**
*   **Description:** Manufacturers or brands of the products.

### **Table: categories**
*   **Description:** Hierarchical taxonomy for products.
*   **Attributes:**
    *   `parentId`: Self-reference to allow nested sub-categories.

---

## Domain 3: Universal Media Library (UML)
*Focus: Centralized asset management for images, videos, and documents.*

### **Table: medias**
*   **Description:** Central repository for all physical assets used across the platform.
*   **Attributes:**
    *   `name`: Original filename or display name.
    *   `file_key`: Unique internal identifier (e.g., local filename or provider ID).
    *   `type`: Categorization (`image`, `video`, `document`, `audio`, `other`).
    *   `provider`: Origin of the asset (`local`, `mux`).
    *   `mime_type`: Standard file format identifier (e.g., `application/pdf`).
    *   `file_size`: Size in bytes.
    *   `url`: Publicly accessible link to the asset.
    *   `metadata`: JSON field containing type-specific data (Mux IDs, dimensions, etc.).

### **Junction Tables:**
*   **product_medias:** Maps products to medias with `is_primary` and `sort_order`.
*   **portfolio_medias:** Maps portfolios to medias with `is_primary` and `sort_order`.

---

## Domain 4: Content Management (CM)
*Focus: Showcasing completed projects and marketing content.*

### **Table: portfolios**
*   **Description:** Records of completed projects, court installations, or case studies.
*   **Attributes:**
    *   `title`: Name of the project.
    *   `location`: Physical area where the project was completed (e.g., "Jakarta").
    *   `completion_date`: The date the project was finalized.
    *   `is_featured`: Controls visibility in the "Featured Projects" section.
    *   `created_by`: Reference to the user who documented the project.

---

## Domain 5: System Administration (SA)
*Focus: Logging, auditing, and maintenance.*

### **Table: audit_logs**
*   **Description:** Immutable record of sensitive actions taken within the system for security and troubleshooting.
*   **Attributes:**
    *   `user_id`: The user who performed the action.
    *   `username_snapshot`: Captures the username at the time of action (in case user is deleted).
    *   `action`: Verb describing the event (e.g., "LOGIN", "UPDATE_PRODUCT").
    *   `entity_id`: ID of the affected record (e.g., the Product ID).
    *   `ip_address`: Network origin of the request.
    *   `details`: JSON or text blob containing the "before" and "after" state of the data.
