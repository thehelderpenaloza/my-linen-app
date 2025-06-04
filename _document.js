import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Theme color for Chrome, Android */}
          <meta name="theme-color" content="#3b82f6" />

          {/* Link to PWA manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* Android icons */}
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/icons/icon-192x192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="512x512"
            href="/icons/icon-512x512.png"
          />

          {/* iOS meta tags */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-title" content="LinenCount" />
          <link
            rel="apple-touch-icon"
            href="/icons/apple-icon-180x180.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;