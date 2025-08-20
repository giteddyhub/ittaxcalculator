export default function Head() {
  return (
    <>
      <link rel="icon" href="/favicon.png?v=8" type="image/png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=8" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var links = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
              for (var i=0;i<links.length;i++) { links[i].parentNode.removeChild(links[i]); }
              var l = document.createElement('link');
              l.rel='icon'; l.type='image/png'; l.href='/favicon.png?v=8';
              document.getElementsByTagName('head')[0].appendChild(l);
            })();
          `,
        }}
      />
      <meta name="theme-color" content="#0b1220" />
    </>
  );
}


