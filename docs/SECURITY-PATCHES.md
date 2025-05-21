# Security Patches Log

This document tracks all security-related updates and patches applied to the GHR Properties website.

## CVE-2025-29927: Next.js Middleware Authorization Bypass (May 2025)

### Issue

Next.js versions from 11.1.4 through 13.5.6, 14.x up to 14.2.24, and 15.x up to 15.2.2 contained a vulnerability where the middleware could be bypassed by adding a specially crafted `x-middleware-subrequest` header to HTTP requests. This vulnerability could potentially allow attackers to bypass authorization implemented in middleware.

### Impact

The vulnerability has a CVSS score of 9.1 (Critical). The theoretical impact depends on how middleware is used in the application:
- Authorization/authentication bypass if implemented in middleware
- Bypassing security headers like Content Security Policy if set in middleware
- Bypassing redirects or rewrites that handle access control

### Fix Applied

1. Updated Next.js from version 14.1.4 to 14.2.25 (patched version)
2. Updated eslint-config-next to match the Next.js version (14.2.25)
3. Added an additional layer of protection in .htaccess to unset the `x-middleware-subrequest` header:
   ```
   RequestHeader unset x-middleware-subrequest
   ```

### References

- [GitHub Security Advisory](https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw)
- [JFrog Security Research Blog](https://jfrog.com/blog/cve-2025-29927-next-js-authorization-bypass/)
- [ProjectDiscovery Analysis](https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass) 