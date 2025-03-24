"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    'users-permissions': {
        config: {
            // Hide the Users & Permissions content types
            contentTypeSettings: {
                hidden: ['user', 'permission', 'role'],
            },
        },
    },
});
