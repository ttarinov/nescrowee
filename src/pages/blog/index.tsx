import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Clock01Icon, User02Icon } from "@hugeicons/core-free-icons";
import { blogPosts } from "./types";

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Learn about our integrations, technical deep-dives, and how Nescrowee is enabling trustless escrow for the future.
          </p>
        </motion.div>

        <div className="space-y-8">
          {blogPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (blogPosts.length - 1) * 0.1 }}
            >
              <Link
                to={`/blog/${blogPosts[blogPosts.length - 1].slug}`}
                className="block rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/70 transition-all hover:border-purple-500/30 group overflow-hidden"
              >
                <div className="aspect-video w-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <div className="text-4xl text-purple-300/50">📝</div>
                </div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {blogPosts[blogPosts.length - 1].category}
                    </span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={20}
                      className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                    {blogPosts[blogPosts.length - 1].title}
                  </h2>
                  <p className="text-gray-400 text-lg mb-6">{blogPosts[blogPosts.length - 1].description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={Clock01Icon} size={16} />
                      <span>{new Date(blogPosts[blogPosts.length - 1].date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={User02Icon} size={16} />
                      <span>{blogPosts[blogPosts.length - 1].author}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blogPosts[blogPosts.length - 1].tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded bg-slate-800/50 text-gray-400 border border-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts.slice(0, -1).map((post, index) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="block rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/70 transition-all hover:border-purple-500/30 group overflow-hidden"
                >
                  <div className="aspect-video w-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <div className="text-2xl text-purple-300/50">📝</div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {post.category}
                      </span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={20}
                        className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={Clock01Icon} size={14} />
                        <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={User02Icon} size={14} />
                        <span>{post.author}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded bg-slate-800/50 text-gray-400 border border-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
