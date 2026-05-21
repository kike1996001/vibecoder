import { motion } from "framer-motion";
import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  Monitor,
  Check,
  ChevronRight,
  Key,
  Smartphone,
  Mail,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const settingsGroups = [
  {
    icon: User,
    title: "Profile",
    description: "Manage your personal information",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure alerts and reminders",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Password and authentication settings",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Theme and customization options",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Globe,
    title: "Language",
    description: "Language and region settings",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
];

export function Settings() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [streamResponse, setStreamResponse] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your development experience
          </p>
        </motion.div>

        {/* Theme Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-white/10 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-purple-400" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "light", icon: Sun, label: "Light", desc: "Clean & bright" },
                  { value: "dark", icon: Moon, label: "Dark", desc: "Easy on eyes" },
                  { value: "system", icon: Monitor, label: "System", desc: "Auto switch" },
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTheme(option.value as typeof theme)}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-300",
                      theme === option.value
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    {theme === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <Check className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      theme === option.value ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
                    )}>
                      <option.icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-white/10 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-amber-400" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  id: "notifications",
                  title: "Push Notifications",
                  description: "Receive alerts about project changes and AI completions",
                  icon: Bell,
                  state: notifications,
                  setState: setNotifications,
                },
                {
                  id: "autosave",
                  title: "Auto Save",
                  description: "Automatically save changes every 30 seconds",
                  icon: Check,
                  state: autoSave,
                  setState: setAutoSave,
                },
                {
                  id: "stream",
                  title: "Stream Responses",
                  description: "Show AI responses in real-time as they generate",
                  icon: Smartphone,
                  state: streamResponse,
                  setState: setStreamResponse,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={item.state}
                    onCheckedChange={item.setState}
                  />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {settingsGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="group cursor-pointer border-white/10 bg-card/50 backdrop-blur-xl hover:border-white/20 transition-all"
                onClick={() => setActiveSection(group.title)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", group.bgColor)}>
                        <group.icon className={cn("h-5 w-5", group.color)} />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {group.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* API Keys Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-white/10 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-emerald-400" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Gemini API</p>
                    <p className="text-xs text-muted-foreground">Connected â€¢ gsk_â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10">
                  Manage
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Anthropic API</p>
                    <p className="text-xs text-muted-foreground">Connected â€¢ sk-ant-â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/10">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="pb-8"
        >
          <Card className="border-white/10 bg-gradient-to-br from-primary/10 to-orange-500/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                    KM
                  </div>
                  <div>
                    <h3 className="font-semibold">Kike Mauro Nguema</h3>
                    <p className="text-sm text-muted-foreground">kike.mauro@email.com</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                        Discover Plan
                      </span>
                      <span className="text-xs text-muted-foreground">1,000 credits remaining</span>
                    </div>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    Upgrade Plan
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

