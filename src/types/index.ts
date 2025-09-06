export type Lang = "en" | "es" | "pt";

export type TileSpec = {
  key: string; // 'happy', 'sad', ...
  label: Record<Lang, string>; // localized captions
  assetPath: string; // imported image URL
  backgroundColor?: string; // optional tile bg
};

export type Category = {
  key: "goodBody" | "goodFeelings" | "badFeelings" | "badBody";
  label: Record<Lang, string>;
  tiles: TileSpec[];
  categoryImage?: string; // Optional category image
};

export type Avatar = {
  pngBlob?: Blob; // 512x512 transparent PNG (optional for backward compatibility)
  originalFile: File; // Original uploaded image file
};

export type Voice = {
  id: string;
  name: string;
  lang: string;
  default: boolean;
};

export type AppState = {
  avatar: Avatar | null;
  language: Lang;
  highContrast: boolean;
  avatarsCreated: number;
  currentCategory: Category["key"] | null;
};

// Force refresh
