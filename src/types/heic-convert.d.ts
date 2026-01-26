declare module "heic-convert" {
  export type HeicConvertOptions = {
    buffer: Buffer;
    format: "JPEG" | "PNG";
    quality?: number;
  };

  const heicConvert: (options: HeicConvertOptions) => Promise<Uint8Array>;
  export default heicConvert;
}
