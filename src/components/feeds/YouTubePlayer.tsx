'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Play, X, ThumbsUp, MessageCircle, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  thumbnail: string;
}

interface Comment {
  authorName: string;
  authorImage: string;
  text: string;
  likeCount: number;
  publishedAt: string;
}

interface VideoInfo {
  title: string;
  channelTitle: string;
  channelId: string;
  viewCount: string;
  likeCount: string;
}

function formatCount(count: string): string {
  const n = parseInt(count, 10);
  if (isNaN(n)) return count;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function YouTubePlayer({
  videoId,
  title,
  channelTitle,
  channelId,
  thumbnail,
}: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Fetch comments and video info when playing
  useEffect(() => {
    if (!playing) return;

    let cancelled = false;
    setCommentsLoading(true);

    fetch(`/api/youtube/video?videoId=${videoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setVideoInfo(data.video);
          setComments(data.comments || []);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch video details:', err);
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playing, videoId]);

  const subscribeUrl = `https://www.youtube.com/channel/${channelId}?sub_confirmation=1`;

  return (
    <Card className="relative overflow-hidden bg-card border-border hover:border-primary/40 transition-all duration-500 group min-h-[280px] flex flex-col">
      {/* ─── Playing State ─── */}
      {playing ? (
        <>
          {/* Video embed */}
          <div className="relative w-full aspect-video bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />

            {/* Close button */}
            <button
              onClick={() => setPlaying(false)}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
              aria-label="Close video"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Channel info + Subscribe */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {channelTitle.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-foreground font-medium truncate">
                  {channelTitle}
                </p>
                {videoInfo && (
                  <p className="text-xs text-muted-foreground">
                    {formatCount(videoInfo.viewCount)} views
                  </p>
                )}
              </div>
            </div>

            <a
              href={subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-white text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
            >
              Subscribe
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Comments section */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[240px]">
            {commentsLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              </div>
            )}

            {!commentsLoading && comments.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No comments to display
              </p>
            )}

            {!commentsLoading &&
              comments.map((comment, i) => (
                <div
                  key={`${comment.authorName}-${i}`}
                  className="flex gap-2"
                >
                  {/* Author avatar */}
                  {comment.authorImage ? (
                    <Image
                      src={comment.authorImage}
                      alt={comment.authorName}
                      width={24}
                      height={24}
                      className="rounded-full shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0 mt-0.5">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Comment body */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {comment.authorName}
                      </span>
                      {comment.publishedAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {timeAgo(comment.publishedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">
                      {comment.text}
                    </p>
                    {comment.likeCount > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <ThumbsUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {comment.likeCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        /* ─── Thumbnail State ─── */
        <>
          {/* Thumbnail background */}
          <div className="relative w-full aspect-video">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Play button */}
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group/play"
              aria-label={`Play ${title}`}
            >
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover/play:bg-white/30 transition-all duration-300">
                <Play className="h-6 w-6 text-white ml-0.5" />
              </div>
            </button>

            {/* Title overlay */}
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-sm text-white font-medium line-clamp-2 drop-shadow-lg">
                {title}
              </p>
            </div>
          </div>

          {/* Channel info below thumbnail */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {channelTitle.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {channelTitle}
              </span>
            </div>

            {channelId && (
              <a
                href={subscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-primary hover:text-primary/80 transition-colors shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                Subscribe
              </a>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
