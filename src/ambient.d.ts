declare let self: ServiceWorkerGlobalScope;

declare module '*?manifest' {
  const manifest: any;
  export default manifest;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
      identify: (properties: { id: string; [key: string]: any }) => void;
    };
  }
}

export {};
