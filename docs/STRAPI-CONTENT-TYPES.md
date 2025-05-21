# Strapi Content Types for GHR Properties

This guide explains how to work with the Strapi content types for the GHR Properties website.

## Property Content Type

The Property content type is used to store property listings that will be displayed on the website.

### Field Structure

Based on our integration with Strapi, the following fields are used:

| Field Name | Type | Description |
|------------|------|-------------|
| Title | Text | The title/name of the property |
| Description | Rich Text or Text | Detailed description of the property |
| Price | Number | The price of the property in IDR |
| Location | Text | The location of the property |
| Bedrooms | Number | Number of bedrooms |
| Bathrooms | Number | Number of bathrooms |
| Area | Number | The area size in square meters |
| Status | Enumeration | Property status (e.g., for_sale, for_rent, sold, rented) |
| Image | Media (Collection) | Images of the property |
| Slug | Text | URL-friendly identifier for the property |

### Creating a New Property

To add a new property listing:

1. Log in to your Strapi admin panel at `http://localhost:1337/admin`
2. Navigate to "Content Manager" > "Properties" > "Create new entry"
3. Fill in the required fields:
   - Title (required): Enter a descriptive title for the property
   - Description: Provide a detailed description
   - Price: Enter the property price
   - Location: Specify the property location
   - Add other details like bedrooms, bathrooms, area
   - Status: Select an appropriate status
   - Upload images to the Image field
   - Create a slug (or it will be generated automatically)
4. Click "Save" to save as draft or "Publish" to make it live immediately

### Image Handling

Images are stored in the `Image` field as a collection. When adding images:

1. Click the "Add images" button
2. Upload images or select from the media library
3. You can rearrange images by dragging them
4. The first image will be used as the featured image

Our frontend code handles various image formats:
- Original: Full size image
- Large: 1000px width version
- Medium: 750px width version
- Small: 500px width version
- Thumbnail: 234px width version

## API Structure

When the data is retrieved from the Strapi API, the properties have the following structure:

```javascript
{
  id: 3,
  documentId: "vmg15py3a8lvndtf8ry48cof",
  Title: "Test-property",
  Description: "Test-desc",
  createdAt: "2025-03-24T20:57:16.086Z",
  updatedAt: "2025-03-24T20:58:43.472Z",
  publishedAt: "2025-03-24T20:58:43.480Z",
  Image: [
    {
      id: 1,
      name: "property-image.jpeg",
      alternativeText: null,
      caption: null,
      width: 1280,
      height: 853,
      formats: {
        thumbnail: {
          url: "/uploads/thumbnail_property_image_dfe68a32c5.jpeg"
        },
        large: {
          url: "/uploads/large_property_image_dfe68a32c5.jpeg"
        },
        medium: {
          url: "/uploads/medium_property_image_dfe68a32c5.jpeg"
        },
        small: {
          url: "/uploads/small_property_image_dfe68a32c5.jpeg"
        }
      },
      url: "/uploads/property_image_dfe68a32c5.jpeg"
    }
  ]
}
```

## Permissions

For the properties to be accessible from the frontend:

1. Navigate to Settings > Roles > Public
2. Set the following permissions for Properties:
   - Find (to list all properties)
   - FindOne (to view a single property)
3. Save your changes

## Adding New Fields

If you need to add new fields to the Property content type:

1. Go to Settings > Content-Types Builder > Property
2. Click "Add another field"
3. Select the appropriate field type
4. Configure the field settings
5. Save your changes

After adding new fields, remember to update your frontend code to handle the new data. 