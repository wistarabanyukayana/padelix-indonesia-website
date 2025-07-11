import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksContactFormBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contact_form_blocks';
  info: {
    displayName: 'Contact Form Block';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksContactInfoBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contact_info_blocks';
  info: {
    displayName: 'Contact Info Block';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    logoLink: Schema.Attribute.Component<'elements.logo-link', true> &
      Schema.Attribute.Required;
  };
}

export interface ElementsLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    href: Schema.Attribute.String;
    isEksternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    text: Schema.Attribute.String;
  };
}

export interface ElementsLogo extends Struct.ComponentSchema {
  collectionName: 'components_elements_logos';
  info: {
    displayName: 'Logo';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      ['white', 'black', 'green', 'red']
    >;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    logoText: Schema.Attribute.String;
  };
}

export interface ElementsLogoLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_logo_links';
  info: {
    displayName: 'Logo Link';
  };
  attributes: {
    link: Schema.Attribute.Component<'elements.link', false>;
    logo: Schema.Attribute.Component<'elements.logo', false>;
  };
}

export interface LayoutsHeader extends Struct.ComponentSchema {
  collectionName: 'components_layouts_headers';
  info: {
    displayName: 'Header';
  };
  attributes: {
    logo: Schema.Attribute.Component<'elements.logo', false>;
  };
}

export interface SectionsCertificateSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_certificate_sections';
  info: {
    displayName: 'Certificate Section';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      ['white', 'black', 'green', 'red']
    > &
      Schema.Attribute.Required;
    certificates: Schema.Attribute.Component<'elements.logo', true> &
      Schema.Attribute.Required;
    subheading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsContactSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_contact_sections';
  info: {
    displayName: 'Contact Section';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      ['white', 'black', 'green', 'red']
    >;
    contactForm: Schema.Attribute.Component<'blocks.contact-form-block', false>;
    contactInfo: Schema.Attribute.Component<'blocks.contact-info-block', false>;
    subheading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_sections';
  info: {
    displayName: 'Hero Section';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      ['white', 'black', 'green', 'red']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'white'>;
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SectionsInfoSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_info_sections';
  info: {
    displayName: 'Info Section';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      ['white', 'black', 'green', 'red']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'white'>;
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    reversed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    subheading: Schema.Attribute.String;
  };
}

export interface SectionsProductSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_product_sections';
  info: {
    displayName: 'Product Section';
  };
  attributes: {
    backgroundColor: Schema.Attribute.Enumeration<
      ['white', 'black', 'green', 'red']
    > &
      Schema.Attribute.Required;
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    subheading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Produk'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.contact-form-block': BlocksContactFormBlock;
      'blocks.contact-info-block': BlocksContactInfoBlock;
      'elements.link': ElementsLink;
      'elements.logo': ElementsLogo;
      'elements.logo-link': ElementsLogoLink;
      'layouts.header': LayoutsHeader;
      'sections.certificate-section': SectionsCertificateSection;
      'sections.contact-section': SectionsContactSection;
      'sections.hero-section': SectionsHeroSection;
      'sections.info-section': SectionsInfoSection;
      'sections.product-section': SectionsProductSection;
    }
  }
}
