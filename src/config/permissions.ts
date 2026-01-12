export const PERMISSIONS = {
  MANAGE_CATEGORIES: "manage_categories",
  MANAGE_PORTFOLIOS: "manage_portfolios",
  MANAGE_MEDIA: "manage_media",
  MANAGE_USERS: "manage_users",
  MANAGE_BRANDS: "manage_brands",
  MANAGE_PRODUCTS: "manage_products",
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_AUDIT_LOGS: "view_audit_logs",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
