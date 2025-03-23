# GHR Properties Website

A modern property listing website with a content snapshot approach for maximum reliability, performance, and security.

## Project Architecture

This project uses a unique approach that combines:

1. **Local Content Management**: Manage properties via Strapi CMS running locally
2. **Static Site Generation**: Build high-performance static website with Next.js
3. **Content Snapshots**: Export data and images from Strapi to JSON snapshots
4. **Automated Deployment**: Use GitHub Actions to build and deploy to cPanel

### Key Benefits

- **No Database Dependency**: The production site has no database requirements
- **Maximum Performance**: Static HTML, CSS and JavaScript for blazing-fast load times
- **High Reliability**: Site remains operational even when CMS is offline
- **Enhanced Security**: No server-side code or database connections in production
- **SEO Friendly**: Pre-rendered HTML for optimal search engine indexing
- **Cost Effective**: Minimal hosting requirements (just static file hosting)

## Content Management Workflow

1. **Local CMS Setup**:
   - Run Strapi CMS locally for property management
   - Add/edit property listings with details, pricing, images, etc.

2. **Export Content Snapshot**:
   - Run `npm run export-data` to create a snapshot
   - Data is exported to JSON files in `/data` directory
   - Images are downloaded, optimized and stored in `/public/images/properties`

3. **Commit and Push**:
   - Commit the updated snapshots to the repository
   - Push to GitHub to trigger the automated build and deployment

4. **Automated Deployment**:
   - GitHub Actions builds the static site using the snapshot data
   - Deploys the generated files to cPanel hosting via FTP

## Development

### Prerequisites

- Node.js (v18+)
- Strapi CMS (v4+) setup locally
- Git

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ghrproperties.id.git
   cd ghrproperties.id
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

### Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run export-data` - Export content from Strapi to data snapshots
- `npm run snapshot-build` - Export data and build the site in one command

## Deployment

### Manual Deployment

1. Export the content and build the site:
   ```
   npm run snapshot-build
   ```

2. Deploy the `/out` directory to your web server:
   ```
   scp -r ./out/* user@your-server:/path/to/hosting
   ```

### Automated Deployment

The automated deployment is handled by GitHub Actions. When you push to the main branch:

1. The workflow defined in `.github/workflows/deploy.yml` is triggered
2. It installs dependencies and builds the site
3. Deploys the built files to cPanel via FTP

### Environment Variables

For the GitHub Actions deployment, set these secrets in your GitHub repository:

- `FTP_SERVER` - Your cPanel server address
- `FTP_USERNAME` - FTP username
- `FTP_PASSWORD` - FTP password
- `FTP_SERVER_DIR` - Target directory on the server

## Project Structure

- `/data` - Content snapshots exported from Strapi
- `/public` - Static assets including exported/optimized images
- `/scripts` - Utility scripts for data export
- `/src/app` - Next.js app directory (pages, layouts)
- `/src/components` - Reusable React components
- `/src/utils` - Utility functions including snapshot handling

## License

This project is proprietary and maintained by GHR Properties.

## Features

- Modern, responsive design optimized for all devices
- Fast-loading pages with optimized assets
- SEO-friendly with proper metadata
- Dark mode support
- Property search functionality
- Featured properties showcase
- Testimonials section
- Contact form

## Tech Stack

- **Frontend**: Next.js 14 (React framework)
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **UI Components**: Custom components with Headless UI
- **Animations**: Framer Motion
- **Deployment**: GitHub Actions to Bluehost

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ryoosari/ghrproperties.id.git
cd ghrproperties.id
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

- `src/app`: App Router pages and layouts
- `src/components`: Reusable UI components
- `src/styles`: Global styles and Tailwind configuration
- `src/utils`: Utility functions
- `public`: Static assets like images

## Deployment

The website is automatically deployed to Bluehost using GitHub Actions when changes are pushed to the main branch.

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Contact

For any inquiries, please contact info@ghrproperties.id.
