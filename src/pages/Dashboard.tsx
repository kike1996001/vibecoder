import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Code2,
  MessageSquare,
  Clock,
  ArrowUpRight,
  Activity,
  GitBranch,
  FileCode,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const stats = [
  {
    title: "Proyectos Activos",
    value: "12",
    change: "+3",
    icon: Code2,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Archivos Generados",
    value: "284",
    change: "+24",
    icon: FileCode,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Prompts Enviados",
    value: "1,429",
    change: "+89",
    icon: MessageSquare,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Tiempo Ahorrado",
    value: "48h",
    change: "+12h",
    icon: Clock,
    color: "from-emerald-500 to-teal-500",
  },
];

const recentActivity = [
  {
    action: "Created src/lib/auth.ts",
    project: "Portfolio projects",
    time: "2 min ago",
    type: "file",
  },
  {
    action: "Edited routes.py",
    project: "Portfolio desarrollo web",
    time: "15 min ago",
    type: "edit",
  },
  {
    action: "Start development server",
    project: "Clinica dental moderna",
    time: "1 hour ago",
    type: "server",
  },
  {
    action: "Installed dependencies",
    project: "Portfolio projects",
    time: "2 hours ago",
    type: "package",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Dashboard() {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-8 pb-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              ¡Bienvenido de vuelta, <span className="gradient-text">Kike</span>! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Aquí tienes un resumen de tu actividad y proyectos.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Zap className="h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="card-hover overflow-hidden relative group">
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`}
                />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} opacity-20`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stat.value}</span>
                    <span className="flex items-center text-xs font-medium text-emerald-500">
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="h-[400px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Actividad Reciente
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    Ver todo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between gap-2 px-4">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{
                        delay: 0.5 + i * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      className="flex-1 bg-gradient-to-t from-primary/50 to-primary rounded-t-sm hover:from-primary/70 hover:to-primary transition-colors cursor-pointer group relative"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {height}%
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-muted-foreground px-4">
                  <span>Ene</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Abr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  Últimas Acciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          activity.type === "file" && "bg-blue-500/20 text-blue-500",
                          activity.type === "edit" && "bg-amber-500/20 text-amber-500",
                          activity.type === "server" && "bg-emerald-500/20 text-emerald-500",
                          activity.type === "package" && "bg-purple-500/20 text-purple-500"
                        )}
                      >
                        {activity.type === "file" && <FileCode className="h-4 w-4" />}
                        {activity.type === "edit" && <TrendingUp className="h-4 w-4" />}
                        {activity.type === "server" && <Zap className="h-4 w-4" />}
                        {activity.type === "package" && <Code2 className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.project} • {activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Continuar Editando",
              desc: "Portfolio projects - 3 archivos pendientes",
              icon: Code2,
              color: "bg-blue-500/10 text-blue-500",
            },
            {
              title: "Revisar Preview",
              desc: "Últimos cambios en el servidor de desarrollo",
              icon: Zap,
              color: "bg-emerald-500/10 text-emerald-500",
            },
            {
              title: "Chat con Agente",
              desc: "Hacer cambios o corregir errores",
              icon: MessageSquare,
              color: "bg-purple-500/10 text-purple-500",
            },
          ].map((action) => (
            <motion.div key={action.title} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Card className="cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl", action.color)}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{action.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </ScrollArea>
  );
}
