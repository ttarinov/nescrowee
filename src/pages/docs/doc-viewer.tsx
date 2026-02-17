import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import MarkdownViewer from "./doc-components/markdown-viewer";
import { getDocById } from "./docs-config";
import ApiDocsPage from "./api";
import McpDocsPage from "./mcp";

const DocViewer = () => {
  const { docId } = useParams<{ docId: string }>();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const doc = docId ? getDocById(docId) : null;

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }

    if (docId === "api-reference") {
      setLoading(false);
      return;
    }

    if (docId === "mcp-specification") {
      setLoading(false);
      return;
    }

    if (!doc) {
      setError("Document not found");
      setLoading(false);
      return;
    }

    if (doc.path.endsWith(".md")) {
      fetch(doc.path)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to load: ${res.statusText}`);
          }
          return res.text();
        })
        .then((text) => {
          setContent(text);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [docId, doc]);

  if (docId === "api-reference") {
    return <ApiDocsPage />;
  }

  if (docId === "mcp-specification") {
    return <McpDocsPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16 pt-32">
          <div className="text-red-400">Error: {error || "Document not found"}</div>
          <Link to="/docs" className="text-purple-400 hover:text-purple-300 underline mt-4 inline-block">
            Back to Documentation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 pt-32">
        <Link
          to="/docs"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-8"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          <span>Back to Documentation</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{doc.title}</h1>
          {doc.description && (
            <p className="text-lg text-gray-400 mb-8">{doc.description}</p>
          )}
          <div className="prose prose-invert max-w-none">
            <MarkdownViewer content={content} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocViewer;
