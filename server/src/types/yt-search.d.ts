declare module 'yt-search' {
  interface VideoResult {
    videoId: string;
    title: string;
    url: string;
    thumbnail: string;
    description: string;
    duration: { seconds: number; timestamp: string };
    views: number;
    author: { name: string; url: string };
  }

  interface SearchResult {
    videos: VideoResult[];
    playlists: any[];
    accounts: any[];
  }

  function ytSearch(query: string): Promise<SearchResult>;
  export = ytSearch;
}
