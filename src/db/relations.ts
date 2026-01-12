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
		portfolios: r.many.portfolios(),
		products: r.many.products(),
		roles: r.many.roles(),
	},
	categories: {
		category: r.one.categories({
			from: r.categories.parentId,
			to: r.categories.id,
			alias: "categories_parentId_categories_id"
		}),
		categories: r.many.categories({
			alias: "categories_parentId_categories_id"
		}),
		products: r.many.products(),
	},
	medias: {
		productMedias: r.many.productMedias(),
		portfolioMedias: r.many.portfolioMedias(),
	},
	portfolios: {
		user: r.one.users({
			from: r.portfolios.createdBy,
			to: r.users.id
		}),
		portfolioMedias: r.many.portfolioMedias(),
	},
	portfolioMedias: {
		portfolio: r.one.portfolios({
			from: r.portfolioMedias.portfolioId,
			to: r.portfolios.id
		}),
		media: r.one.medias({
			from: r.portfolioMedias.mediaId,
			to: r.medias.id
		}),
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
		productMedias: r.many.productMedias(),
		productSpecifications: r.many.productSpecifications(),
		productVariants: r.many.productVariants(),
	},
	brands: {
		products: r.many.products(),
	},
	productMedias: {
		product: r.one.products({
			from: r.productMedias.productId,
			to: r.products.id
		}),
		media: r.one.medias({
			from: r.productMedias.mediaId,
			to: r.medias.id
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