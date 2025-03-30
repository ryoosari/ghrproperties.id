'use strict';

/**
 * property controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::property.property', ({ strapi }) => ({
  /**
   * Fix slugs for all properties
   * This is a special admin-only endpoint to fix any properties with generic or missing slugs
   */
  async fixSlugs(ctx) {
    try {
      // This should only be available to administrators
      if (ctx.state.user?.role?.name !== 'Administrator' && ctx.state.user?.role?.type !== 'admin') {
        return ctx.forbidden('Only administrators can access this endpoint');
      }
      
      // Call the service method to fix all property slugs
      const result = await strapi.service('api::property.property').fixPropertySlugs();
      
      return result;
    } catch (error) {
      return ctx.badRequest('Failed to fix property slugs', { error: error.message });
    }
  }
})); 