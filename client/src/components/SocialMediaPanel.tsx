import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  Facebook,
  Instagram,
  Send,
  Clock,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Camera,
  Star,
  Megaphone,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

const POST_TYPES = [
  { value: "blog_share", label: "Blog Article", icon: FileText },
  { value: "project_photo", label: "Project Photo", icon: Camera },
  { value: "testimonial", label: "Testimonial", icon: Star },
  { value: "promotion", label: "Promotion", icon: Megaphone },
  { value: "custom", label: "Custom Post", icon: MessageSquare },
] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", icon: FileText },
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
  publishing: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Loader2 },
  published: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2 },
  failed: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
};

export default function SocialMediaPanel() {
  const [showComposer, setShowComposer] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [postType, setPostType] = useState<string>("custom");
  const [platforms, setPlatforms] = useState({ facebook: true, instagram: true });
  const [context, setContext] = useState("");
  const [service, setService] = useState("");
  const [suburb, setSuburb] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const statusQuery = trpc.social.status.useQuery();
  const postsQuery = trpc.social.list.useQuery();
  const createMutation = trpc.social.create.useMutation();
  const deleteMutation = trpc.social.delete.useMutation();
  const generateCaptionMutation = trpc.social.generateCaption.useMutation();
  const utils = trpc.useUtils();

  const fbConfigured = statusQuery.data?.facebookConfigured ?? false;
  const igConfigured = statusQuery.data?.instagramConfigured ?? false;

  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCaptionMutation.mutateAsync({
        postType: postType as any,
        context: context || undefined,
        service: service || undefined,
        suburb: suburb || undefined,
      });
      setCaption(result.caption);
      toast.success("Caption generated!");
    } catch (err) {
      toast.error("Failed to generate caption");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishNow = async () => {
    if (!caption.trim()) {
      toast.error("Please write a caption first");
      return;
    }
    try {
      const platformStr = [
        platforms.facebook ? "facebook" : "",
        platforms.instagram ? "instagram" : "",
      ].filter(Boolean).join(",");

      const result = await createMutation.mutateAsync({
        caption,
        imageUrl: imageUrl || undefined,
        platforms: platformStr,
        postType: postType as any,
        publishNow: true,
      });

      if (result.success) {
        toast.success("Post published successfully!");
        resetComposer();
        utils.social.list.invalidate();
      } else {
        toast.error(result.errorMessage || "Failed to publish");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to publish");
    }
  };

  const handleSaveDraft = async () => {
    if (!caption.trim()) {
      toast.error("Please write a caption first");
      return;
    }
    try {
      const platformStr = [
        platforms.facebook ? "facebook" : "",
        platforms.instagram ? "instagram" : "",
      ].filter(Boolean).join(",");

      await createMutation.mutateAsync({
        caption,
        imageUrl: imageUrl || undefined,
        platforms: platformStr,
        postType: postType as any,
        scheduledAt: scheduledAt || undefined,
        publishNow: false,
      });

      toast.success(scheduledAt ? "Post scheduled!" : "Draft saved!");
      resetComposer();
      utils.social.list.invalidate();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Post deleted");
      utils.social.list.invalidate();
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const resetComposer = () => {
    setCaption("");
    setImageUrl("");
    setPostType("custom");
    setContext("");
    setService("");
    setSuburb("");
    setScheduledAt("");
    setShowComposer(false);
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Facebook</span>
              {fbConfigured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  <AlertCircle className="h-3 w-3" /> Not configured
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              <span className="text-sm font-medium">Instagram</span>
              {igConfigured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  <AlertCircle className="h-3 w-3" /> Not configured
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={() => setShowComposer(!showComposer)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {showComposer ? "Cancel" : "+ New Post"}
          </Button>
        </div>
        {!fbConfigured && !igConfigured && (
          <p className="mt-3 text-sm text-gray-500">
            To connect your accounts, provide your Meta Page Access Token, Facebook Page ID, and Instagram Business Account ID in the Settings &gt; Secrets panel.
          </p>
        )}
      </div>

      {/* Composer */}
      {showComposer && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-lg">Compose Post</h3>

          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map((pt) => {
                const Icon = pt.icon;
                return (
                  <button
                    key={pt.value}
                    onClick={() => setPostType(pt.value)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                      postType === pt.value
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {pt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Context (for AI)</label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. blog title, project details..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g. Driveway, Slab..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
              <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="e.g. Pimpama, Rochedale..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Caption</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateCaption}
                disabled={isGenerating}
                className="text-xs"
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                Generate with AI
              </Button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
              placeholder="Write your post caption here, or use AI to generate one..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            />
            <p className="text-xs text-gray-400 mt-1">{caption.length} characters</p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <ImageIcon className="h-3.5 w-3.5 inline mr-1" />
              Image URL (required for Instagram)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... (public image URL)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
            />
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Preview"
                  width={200}
                  height={128}
                  loading="lazy"
                  decoding="async"
                  className="h-32 w-auto rounded-md border object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platforms.facebook}
                  onChange={(e) => setPlatforms(p => ({ ...p, facebook: e.target.checked }))}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <Facebook className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platforms.instagram}
                  onChange={(e) => setPlatforms(p => ({ ...p, instagram: e.target.checked }))}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <Instagram className="h-4 w-4 text-pink-600" />
                <span className="text-sm">Instagram</span>
              </label>
            </div>
            {platforms.instagram && !imageUrl && (
              <p className="text-xs text-amber-600 mt-1">
                <AlertCircle className="h-3 w-3 inline mr-0.5" />
                Instagram requires an image. Add an image URL above to post to Instagram.
              </p>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="h-3.5 w-3.5 inline mr-1" />
              Schedule (optional)
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500 max-w-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t">
            <Button
              onClick={handlePublishNow}
              disabled={createMutation.isPending || !caption.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish Now
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={createMutation.isPending || !caption.trim()}
            >
              {scheduledAt ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={resetComposer}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Post History</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => utils.social.list.invalidate()}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>

        {postsQuery.isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading posts...
          </div>
        ) : !postsQuery.data?.length ? (
          <div className="p-8 text-center text-gray-400">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No posts yet. Create your first post above!</p>
          </div>
        ) : (
          <div className="divide-y">
            {postsQuery.data.map((post) => {
              const statusStyle = STATUS_STYLES[post.status] || STATUS_STYLES.draft;
              const StatusIcon = statusStyle.icon;
              const postPlatforms = post.platforms.split(",").map(p => p.trim());

              return (
                <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Status + Platforms */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <StatusIcon className="h-3 w-3" />
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                        {postPlatforms.includes("facebook") && (
                          <Facebook className="h-4 w-4 text-blue-600" />
                        )}
                        {postPlatforms.includes("instagram") && (
                          <Instagram className="h-4 w-4 text-pink-600" />
                        )}
                        <span className="text-xs text-gray-400">
                          {post.postType.replace("_", " ")}
                        </span>
                      </div>

                      {/* Caption preview */}
                      <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">
                        {post.caption}
                      </p>

                      {/* Image thumbnail */}
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt=""
                          width={64}
                          height={64}
                          loading="lazy"
                          decoding="async"
                          className="h-16 w-16 rounded mt-2 object-cover border"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}

                      {/* Meta info */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>Created: {new Date(post.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        {post.publishedAt && (
                          <span>Published: {new Date(post.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                        {post.scheduledAt && post.status === "scheduled" && (
                          <span className="text-blue-500">Scheduled: {new Date(post.scheduledAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                      </div>

                      {/* Error message */}
                      {post.errorMessage && (
                        <p className="text-xs text-red-500 mt-1">
                          <AlertCircle className="h-3 w-3 inline mr-0.5" />
                          {post.errorMessage}
                        </p>
                      )}

                      {/* Post IDs */}
                      {(post.fbPostId || post.igPostId) && (
                        <div className="flex gap-3 mt-1 text-xs text-gray-400">
                          {post.fbPostId && <span>FB: {post.fbPostId}</span>}
                          {post.igPostId && <span>IG: {post.igPostId}</span>}
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    {(post.status === "draft" || post.status === "failed") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
