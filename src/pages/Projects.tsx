import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Search, MoreHorizontal, GitBranch, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const projects = [
  {
    id: 1,
    name: "Portfolio projects",
    description: "Dashboard de portfolio personal con analytics",
    status: "active",
    lastUpdated: "2 minutes ago",
    tech: ["React", "Tailwind", "Framer Motion"],
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    id: 2,
    name: "Portfolio desarrollo web v2",
    description: "Nueva versión del portfolio con Next.js",
    status: "building",
    lastUpdated: "1 hour ago",
    tech: ["Next.js", "TypeScript", "Prisma"],
    color: "from-rose-500/20 to-red-500/20",
  },
  {
    id: 3,
    name: "Clinica dental moderna",
    description: "App de gestión para clínica dental",
    status: "idle",
    lastUpdated: "3 hours ago",
    tech: ["React", "Node.js", "PostgreSQL"],
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: 4,
    name: "E-commerce dashboard",
    description: "Panel de administración para tienda online",
    status: "active",
    lastUpdated: "5 hours ago",
    tech: ["Vue", "Firebase", "Stripe"],
    color: "from-orange-500/20 to-red-500/20",
  },
];

export function Projects() {
  const [search, setSearch] = useState("");

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage and organize your apps</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </motion.div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-11 bg-white/5 border-white/10 focus:border-primary/50"
          />
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <Card
                className={cn(
                  "group relative overflow-hidden border-white/10 bg-gradient-to-br hover:border-white/20 transition-all cursor-pointer",
                  project.color
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          project.status === "active" && "bg-emerald-500/20 text-emerald-400",
                          project.status === "building" && "bg-amber-500/20 text-amber-400",
                          project.status === "idle" && "bg-slate-500/20 text-slate-400"
                        )}
                      >
                        <GitBranch className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{project.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {project.lastUpdated}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </motion.button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 rounded-md bg-white/10 text-xs text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, x: 2 }}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Projects;
