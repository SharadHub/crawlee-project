import { CheerioCrawler, Dataset } from "crawlee";

const crawler = new CheerioCrawler({

    // logic to scrape data from list page
  async requestHandler({ $, request }) {
    if (request.label === "LIST" || !request.label) {
      const news = $("div.ok-news-post.ltr-post");

      for (const [index, item] of news.toArray().entries()) {
        const url = $(item).find("h2 a").attr("href");
        if (url) {
          await crawler.addRequests([
            {
              url,
              label: "DETAIL",
            },
          ]);
        }
      }
    //   console.log("next_page:", $("a.next.page-numbers").attr("href"));


      // logic to go to next page 
      const next_page = $("a.next.page-numbers").attr("href");
      let page = request.userData.page || 1;
      if (next_page && page < 10) {
        await crawler.addRequests([
          {
            url: next_page,
            label: "LIST",
            userData:{
                page:page+1
            }
          },
        ]);
      }
    }

    // logic to scrape data from detail page
    if (request.label === "DETAIL") {
      const headline = $("h1").text().trim();
      const date = $("span.ok-post-date").text().trim();
      const image = $("figure.wp-block-image img").attr("src");
      const content = $("p.wp-block-paragraph")
        .map((i, value) => $(value).text().trim())
        .get()
        .join(" ");

      await Dataset.pushData({
        Headline: headline,
        Date: date,
        Image: image,
        "News Content": content,
        url: request.url,
      });
    }
  },
});

await crawler.run([
  {
    url: "https://english.onlinekhabar.com/category/political",
    label: "LIST",
  },
]);
