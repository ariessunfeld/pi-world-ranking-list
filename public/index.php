<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <title>Redirecting</title>
  </head>
  <body>
    <p>Redirecting...</p>
    <script>
      (function () {
        var base = "/pi-world-ranking-list";
        var params = new URLSearchParams(window.location.search);
        var page = params.get("page");
        var category = params.get("category");
        var sort = params.get("sort");
        var target = "/";
        if (page === "lists" && category === "pi" && sort === "country") target = "/pi/countries/";
        else if (page === "lists" && category === "pi" && sort === "continent") target = "/pi/continents/";
        else if (page === "lists" && category === "pi") target = "/pi/";
        else if (page === "lists" && category === "e") target = "/e/";
        else if (page === "lists" && category === "sqrt2") target = "/sqrt2/";
        else if (page === "amazing") target = "/special/amazing-performances/";
        else if (page === "matrix") target = "/special/pi-matrix/";
        else if (page === "ultimate") target = "/special/ultimate-test/";
        else if (page === "pi-permutation") target = "/special/pi-permutation/";
        else if (page === "rules" || page === "registration") target = "/rules/";
        else if (page === "background") target = "/background/";
        else if (page === "links") target = "/links/";
        window.location.replace(base + target);
      })();
    </script>
  </body>
</html>
