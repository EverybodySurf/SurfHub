import { NextResponse } from 'next/server';

/**
 * GET /api/youtube/video?videoId=VIDEO_ID
 *
 * Returns YouTube video stats and top comments.
 * Calls:
 *  - YouTube Data API v3 /videos (for viewCount, likeCount)
 *  - YouTube Data API v3 /commentThreads (top 5 relevant comments)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { success: false, error: 'Missing videoId parameter' },
      { status: 400 }
    );
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({
      success: true,
      video: null,
      comments: [],
      note: 'No YouTube API key configured',
    });
  }

  try {
    // Fetch video stats
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;
    const videoController = new AbortController();
    const videoTimeout = setTimeout(() => videoController.abort(), 10000);

    const videoResponse = await fetch(videoUrl, {
      signal: videoController.signal,
    });
    clearTimeout(videoTimeout);

    let video = null;
    if (videoResponse.ok) {
      const videoData = await videoResponse.json();
      if (videoData.items && videoData.items.length > 0) {
        const item = videoData.items[0];
        video = {
          title: item.snippet?.title || '',
          channelTitle: item.snippet?.channelTitle || '',
          channelId: item.snippet?.channelId || '',
          viewCount: item.statistics?.viewCount || '0',
          likeCount: item.statistics?.likeCount || '0',
        };
      }
    }

    // Fetch top 5 comments
    const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=5&order=relevance&key=${API_KEY}`;
    const commentsController = new AbortController();
    const commentsTimeout = setTimeout(() => commentsController.abort(), 10000);

    const commentsResponse = await fetch(commentsUrl, {
      signal: commentsController.signal,
    });
    clearTimeout(commentsTimeout);

    let comments: Array<{
      authorName: string;
      authorImage: string;
      text: string;
      likeCount: number;
      publishedAt: string;
    }> = [];

    if (commentsResponse.ok) {
      const commentsData = await commentsResponse.json();
      if (commentsData.items) {
        comments = commentsData.items.map((item: any) => {
          const snippet = item.snippet?.topLevelComment?.snippet || item.snippet || {};
          return {
            authorName: snippet.authorDisplayName || 'Anonymous',
            authorImage: snippet.authorProfileImageUrl || '',
            text:
              snippet.textOriginal || snippet.textDisplay || '',
            likeCount: snippet.likeCount || 0,
            publishedAt: snippet.publishedAt || '',
          };
        });
      }
    }

    return NextResponse.json({
      success: true,
      video,
      comments,
    });
  } catch (error: any) {
    console.error('YouTube video API error:', error.message);
    return NextResponse.json({
      success: true,
      video: null,
      comments: [],
      error: error.message,
    });
  }
}
