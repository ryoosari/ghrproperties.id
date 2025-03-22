# API Configuration

## Database Credentials

The database credentials are automatically injected from GitHub Secrets during deployment.
You do not need to manually edit the config.php file.

If you need to update the database credentials:

1. Go to your GitHub repository
2. Click on Settings → Secrets and variables → Actions
3. Update the following secrets:
   - DB_HOST (database hostname)
   - DB_USER (database username)
   - DB_PASSWORD (database password)
   - DB_NAME (database name)
4. Re-run the deployment workflow

## Security

Your database credentials are securely stored as encrypted GitHub Secrets and are only
injected during the deployment process. They are not visible in the repository code.
