import manifest from "./static-media-manifest.json" with {type:"json"};

export interface StaticMediaAsset {key:string;sha256:string;bytes:number;contentType:string;tracked:boolean}
export function findStaticMedia(parts: string[]): StaticMediaAsset | undefined {
  if(parts.some(part=>!part || part==="." || part===".." || /[%\\?#]/.test(part))) return undefined;
  return (manifest.assets as Record<string,StaticMediaAsset>)["/"+parts.join("/")];
}
