import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	auditLogs: {
		user: r.one.users({
			from: r.auditLogs.userId,
			to: r.users.id
		}),
	},
	users: {
		auditLogs: r.many.auditLogs(),
		products: r.many.products(),
		roles: r.many.roles(),
	},
	categories: {
		category: r.one.categories({
			from: r.categories.parentId,
			to: r.categories.id,
			alias: "categories_categories"
		}),
		categories: r.many.categories({
			alias: "categories_categories"
		}),
		products: r.many.products(),
	},
	products: {
		brand: r.one.brands({
			from: r.products.brandId,
			to: r.brands.id
		}),
		category: r.one.categories({
			from: r.products.categoryId,
			to: r.categories.id
		}),
		user: r.one.users({
			from: r.products.createdBy,
			to: r.users.id
		}),
		productImages: r.many.productImages(),
		productSpecifications: r.many.productSpecifications(),
		productVariants: r.many.productVariants(),
	},
	brands: {
		products: r.many.products(),
	},
	productImages: {
		product: r.one.products({
			from: r.productImages.productId,
			to: r.products.id
		}),
	},
	productSpecifications: {
		product: r.one.products({
			from: r.productSpecifications.productId,
			to: r.products.id
		}),
	},
	productVariants: {
		product: r.one.products({
			from: r.productVariants.productId,
			to: r.products.id
		}),
	},
	permissions: {
		roles: r.many.roles({
			from: r.permissions.id.through(r.rolesPermissions.permissionsId),
			to: r.roles.id.through(r.rolesPermissions.rolesId)
		}),
	},
	roles: {
		permissions: r.many.permissions(),
		users: r.many.users({
			from: r.roles.id.through(r.usersRoles.rolesId),
			to: r.users.id.through(r.usersRoles.usersId)
		}),
	},
}))