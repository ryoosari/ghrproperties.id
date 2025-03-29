"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import type { Core } from '@strapi/strapi';
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
exports.default = {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register( /* { strapi }: { strapi: Core.Strapi } */) { },
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
        // Set up automatic data export when properties change
        strapi.db.lifecycles.subscribe({
            models: ['api::property.property'],
            // After creating a property
            afterCreate() {
                exportStrapiData();
            },
            // After updating a property
            afterUpdate() {
                exportStrapiData();
            },
            // After deleting a property
            afterDelete() {
                exportStrapiData();
            },
        });
        console.log('✅ Auto-export for properties has been set up');
    },
};
/**
 * Run the export-strapi-data script
 */
function exportStrapiData() {
    try {
        console.log('🔄 Content changed, automatically exporting data...');
        // Path to the Next.js project root (parent of strapi-backend)
        const projectRoot = path_1.default.resolve(__dirname, '../../../');
        // Run the export script with auto-commit enabled
        (0, child_process_1.execSync)('AUTO_COMMIT=true npm run export-data', {
            cwd: projectRoot,
            stdio: 'inherit'
        });
        console.log('✅ Data export completed successfully');
    }
    catch (error) {
        console.error('❌ Error exporting data:', error);
    }
}
