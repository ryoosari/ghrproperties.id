import type { Schema, Struct } from '@strapi/strapi';

export interface SharedAmenity extends Struct.ComponentSchema {
  collectionName: 'components_shared_amenities';
  info: {
    description: 'Features and facilities of a property';
    displayName: 'Amenity';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedCertification extends Struct.ComponentSchema {
  collectionName: 'components_shared_certifications';
  info: {
    description: 'Professional certifications and qualifications';
    displayName: 'Certification';
  };
  attributes: {
    description: Schema.Attribute.Text;
    expiryDate: Schema.Attribute.Date;
    image: Schema.Attribute.Media<'images'>;
    issueDate: Schema.Attribute.Date;
    issuer: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLocation extends Struct.ComponentSchema {
  collectionName: 'components_shared_locations';
  info: {
    description: 'Address and geographic coordinates for properties';
    displayName: 'Location';
  };
  attributes: {
    address: Schema.Attribute.String & Schema.Attribute.Required;
    city: Schema.Attribute.String & Schema.Attribute.Required;
    country: Schema.Attribute.String & Schema.Attribute.Required;
    latitude: Schema.Attribute.Decimal;
    longitude: Schema.Attribute.Decimal;
    mapUrl: Schema.Attribute.String;
    neighborhood: Schema.Attribute.String;
    postalCode: Schema.Attribute.String;
    state: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedNearbyPlace extends Struct.ComponentSchema {
  collectionName: 'components_shared_nearby_places';
  info: {
    description: 'Points of interest near the property';
    displayName: 'Nearby Place';
  };
  attributes: {
    description: Schema.Attribute.Text;
    distance: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    distanceUnit: Schema.Attribute.Enumeration<['km', 'm', 'mi']> &
      Schema.Attribute.DefaultTo<'km'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<
      [
        'school',
        'hospital',
        'shopping',
        'restaurant',
        'park',
        'transportation',
        'other',
      ]
    > &
      Schema.Attribute.Required;
  };
}

export interface SharedPropertySpecs extends Struct.ComponentSchema {
  collectionName: 'components_shared_property_specs';
  info: {
    description: 'Key specifications of a property';
    displayName: 'Property Specifications';
  };
  attributes: {
    areaUnit: Schema.Attribute.Enumeration<['sqm', 'sqft', 'hectare', 'acre']> &
      Schema.Attribute.DefaultTo<'sqm'>;
    bathrooms: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    bedrooms: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    buildingArea: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    floors: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    furnishingStatus: Schema.Attribute.Enumeration<
      ['unfurnished', 'semiFurnished', 'fullyFurnished']
    > &
      Schema.Attribute.DefaultTo<'unfurnished'>;
    parkingSpaces: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    totalArea: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Search Engine Optimization metadata';
    displayName: 'SEO';
  };
  attributes: {
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

export interface SharedSocialMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_medias';
  info: {
    description: 'Social media profile links';
    displayName: 'Social Media';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      [
        'facebook',
        'instagram',
        'twitter',
        'linkedin',
        'youtube',
        'tiktok',
        'other',
      ]
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    username: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.amenity': SharedAmenity;
      'shared.certification': SharedCertification;
      'shared.location': SharedLocation;
      'shared.media': SharedMedia;
      'shared.nearby-place': SharedNearbyPlace;
      'shared.property-specs': SharedPropertySpecs;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
      'shared.social-media': SharedSocialMedia;
    }
  }
}
