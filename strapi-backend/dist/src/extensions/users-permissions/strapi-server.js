/**
 * Extension for Users & Permissions plugin to hide User content type
 */
module.exports = (plugin) => {
    // Get the content-types from the plugin
    const contentTypes = plugin.contentTypes;
    if (contentTypes.user) {
        // Hide the user content-type
        contentTypes.user.visible = false;
    }
    // Register lifecycle hooks to prevent User operations
    plugin.controllers.user.find = (ctx) => {
        return { users: [], count: 0 };
    };
    plugin.controllers.user.findOne = (ctx) => {
        return null;
    };
    plugin.controllers.user.create = (ctx) => {
        return ctx.badRequest("User creation is disabled");
    };
    plugin.controllers.user.update = (ctx) => {
        return ctx.badRequest("User update is disabled");
    };
    plugin.controllers.user.destroy = (ctx) => {
        return ctx.badRequest("User deletion is disabled");
    };
    return plugin;
};
