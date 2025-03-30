'use strict';

/**
 * property router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

// Create the default router
const defaultRouter = createCoreRouter('api::property.property');

// Add custom routes
const customRoutes = [
  {
    method: 'GET',
    path: '/properties/fix-slugs',
    handler: 'api::property.property.fixSlugs',
    config: {
      policies: [],
      description: 'Fix slugs for all properties with generic or missing slugs',
      tag: {
        plugin: 'admin',
        name: 'Maintenance',
        actionType: 'updateAll'
      }
    }
  }
];

// Export the combined routes
module.exports = {
  routes: [
    ...defaultRouter.routes,
    ...customRoutes
  ]
}; 