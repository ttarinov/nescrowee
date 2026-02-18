import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Book01Icon,
  ApiIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { getDocsByCategoryOrdered } from "./docs-config";

const DocsPage = () => {
  const docsByCategoryOrdered = getDocsByCategoryOrdered();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <HugeiconsIcon icon={Book01Icon} size={32} className="text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Documentation</h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl">
            Learn how to integrate Nescrowee into your applications, bots, and workflows. All documentation describes how to interact with existing smart contract methods—no separate API server required.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-x-10 gap-y-12 mb-12">
          {docsByCategoryOrdered.map(([category, categoryDocs], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">{category}</h2>
              <div className="grid gap-6">
                {categoryDocs.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/docs/${doc.id}`}
                    className="block p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/70 transition-all hover:border-purple-500/30 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <HugeiconsIcon
                          icon={ApiIcon}
                          size={20}
                          className="text-purple-400"
                        />
                      </div>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={18}
                        className="text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="text-gray-400 text-sm">{doc.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
