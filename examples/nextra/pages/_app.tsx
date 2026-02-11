import type { AppProps } from 'next/app';
import { generateSimpleCSS } from '@gu-corp/ascii-diagram';

// Generate the CSS for ASCII diagrams
const asciiCSS = generateSimpleCSS();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{asciiCSS}</style>
      <Component {...pageProps} />
    </>
  );
}
