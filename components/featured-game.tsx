"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface FeaturedGameProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
  index: number
}

export function FeaturedGame({ title, description, icon: Icon, href, color, index }: FeaturedGameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link href={href} className="block h-full">
        <div
          className={`${color} h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
        >
          <div className="p-8 text-white relative overflow-hidden h-full flex flex-col">
            <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10"></div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-black/10"></div>
            </div>
            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="bg-white/20 p-3 rounded-full">
                  <Icon className="h-10 w-10" />
                </div>
                <motion.div
                  className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                >
                  Popular
                </motion.div>
              </div>
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <p className="text-white/80 mb-6 flex-1">{description}</p>
              <Button className="bg-white/20 hover:bg-white/30 text-white w-full group-hover:bg-white group-hover:text-gray-900 transition-colors">
                Jogar Agora
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
