// src/data/static-content.ts
// This file contains the static content for the website, hardcoded from the final CMS validation.

export const GLOBAL_SETTINGS = {
  header: {
    logoText: "Padelix",
    logoUrl: "https://cms.padelix.co.id/uploads/Padelix_Logo_Transparent_8925c52968.png",
    moreOptionIconUrl: "https://cms.padelix.co.id/uploads/menu_555df7d115.svg",
    navLinks: [
      { id: 1, text: "Beranda", href: "/", isExternal: false },
      { id: 2, text: "Produk", href: "/products", isExternal: false },
      { id: 3, text: "Sertifikat", href: "/#sertifikasi-kami", isExternal: false }, 
      { id: 4, text: "Kontak", href: "/#kontak", isExternal: false },
    ],
  },
  footer: {
    logoText: "Padelix",
    text: "Padel Starts Here.",
    copy: "© 2025 Padelix Indonesia. All rights reserved.",
    backgroundColor: "black",
    socialLinks: [
      {
        id: 1,
        text: "Whatsapp",
        href: "https://wa.me/6282122122250",
        isExternal: true,
      },
      {
        id: 2,
        text: "Instagram",
        href: "https://www.instagram.com/padelixindonesia/",
        isExternal: true,
      },
      {
        id: 3,
        text: "Email",
        href: "mailto:business@padelix.co.id",
        isExternal: true,
      },
    ],
  },
};

export const HOME_PAGE_CONTENT = {
  hero: {
    heading: "Selamat datang di Padelix Indonesia!",
    content: "Padelix Indonesia menawarkan solusi terbaik untuk lapangan dan peralatan padel berkualitas tinggi. Bergabunglah dengan kami dan tingkatkan pengalaman bermain Anda.",
    image: {
      src: "https://cms.padelix.co.id/uploads/Default_Hero_Image_f9b13473de.jpg",
      alt: "Padelix Hero Image",
    },
  },
  info: {
    heading: "Tentang Padelix Indonesia",
    subheading: "Tentang",
    content: "Padelix Indonesia adalah perusahaan yang menyediakan lapangan dan juga peralatan padel berkualitas tinggi. Kami berkomitmen untuk memberikan pengalaman bermain yang terbaik bagi para penggemar olahraga ini.",
    image: {
      src: "https://cms.padelix.co.id/uploads/Default_About_Image_ccb3926d22.png",
      alt: "About Padelix",
    },
    reversed: true,
  },
  certificates: {
    subheading: "Sertifikasi Kami",
    items: [
      {
        id: 1,
        name: "Standar Eropa",
        image: "https://cms.padelix.co.id/uploads/Europe_Standards_617a3472ce.png",
      },
      {
        id: 2,
        name: "Standar Tiongkok",
        image: "https://cms.padelix.co.id/uploads/Chinese_Standards_07f806f5ac.png",
      },
      {
        id: 3,
        name: "Standar Spanyol",
        image: "https://cms.padelix.co.id/uploads/Spanish_Standards_0784db5d0f.png",
      },
      {
        id: 4,
        name: "Standar Internasional",
        image: "https://cms.padelix.co.id/uploads/International_Standards_27899cce8e.png",
      },
    ]
  },
  portfolio: {
    subheading: "Projek Berjalan",
    items: [
      {
        id: 1,
        title: "Grogol, Jakarta Barat",
        images: [
          "https://cms.padelix.co.id/uploads/IMG_20250718_WA_0089_a9e089a2b4.jpg",
          "https://cms.padelix.co.id/uploads/IMG_20250718_WA_0090_cc2d51383c.jpg",
          "https://cms.padelix.co.id/uploads/IMG_20250718_WA_0088_30f9e0286d.jpg",
          "https://cms.padelix.co.id/uploads/IMG_20250718_WA_0083_76c3609a32.jpg",
          "https://cms.padelix.co.id/uploads/IMG_20250718_WA_0085_4b2c6352a9.jpg",
          "https://cms.padelix.co.id/uploads/IMG_20250718_WA_0087_7c4ccd74ac.jpg",
          "https://cms.padelix.co.id/uploads/IMG_20250718_WA_0084_7b5db5f217.jpg",
          "https://cms.padelix.co.id/uploads/IMG_20250718_WA_0086_825aeac687.jpg",
        ],
      },
      {
        id: 2,
        title: "Universitas Tarua Negara",
        images: [
          "https://cms.padelix.co.id/uploads/Whats_App_Image_2025_07_18_at_09_28_50_5c132785_d78caaa3ac.jpg",
          "https://cms.padelix.co.id/uploads/Whats_App_Image_2025_07_18_at_09_26_41_b30fa40c_83b97f974d.jpg",
          "https://cms.padelix.co.id/uploads/Whats_App_Image_2025_07_18_at_09_26_38_e842a8ee_bbfbe29cf3.jpg",
        ],
      }
    ]
  },
  contact: {
    subheading: "Kontak",
    infoHeading: "Kontak Bisnis",
    formHeading: "Hubungi Kami",
    links: [
      {
        id: 1,
        label: "Mail",
        text: "business@padelix.co.id",
        href: "mailto:business@padelix.co.id",
        icon: "https://cms.padelix.co.id/uploads/Mail_25c2d768ce.svg",
        color: "red",
      },
      {
        id: 2,
        label: "Whatsapp",
        text: "+6282122122250",
        href: "https://wa.me/6282122122250?text=Apakah%20benar%20ini%20dengan%20Padelix%20Indonesia%3F",
        icon: "https://cms.padelix.co.id/uploads/Whatsapp_be61095bb7.svg",
        color: "green",
      },
      {
        id: 3,
        label: "Instagram",
        text: "Padelix Indonesia",
        href: "https://www.instagram.com/padelixindonesia/",
        icon: "https://cms.padelix.co.id/uploads/instagram_61548c776c.svg",
        color: "red",
      },
      {
        id: 4,
        label: "Facebook",
        text: "Padelix Indonesia",
        href: "https://www.facebook.com/padelixindonesia/",
        icon: "https://cms.padelix.co.id/uploads/facebook_3d726343ef.svg",
        color: "green",
      },
    ]
  }
};