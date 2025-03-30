// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Get all content types
    const contentTypes = strapi.contentTypes;
    
    // Hide Users & Permissions plugin content types from Content-Type Builder
    if (contentTypes['plugin::users-permissions.user']) {
      contentTypes['plugin::users-permissions.user'].visible = false;
    }
    if (contentTypes['plugin::users-permissions.permission']) {
      contentTypes['plugin::users-permissions.permission'].visible = false;
    }
    if (contentTypes['plugin::users-permissions.role']) {
      contentTypes['plugin::users-permissions.role'].visible = false;
    }
    
    // NOTE: Automatic data export has been disabled to prevent Strapi crashes
    // To export data, use the manual export command:
    // npm run export-data
    // or
    // npm run quick-export
    
    console.log('✅ Strapi bootstrap completed');
  },
};
