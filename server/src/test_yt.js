const ytSearch = require('yt-search');

async function testSearch() {
  try {
    const r = await ytSearch('Building a Simple Web Page with HTML and CSS');
    const videos = r.videos.slice(0, 5);
    console.log(JSON.stringify(videos, null, 2));
  } catch (err) {
    console.error(err);
  }
}

testSearch();
