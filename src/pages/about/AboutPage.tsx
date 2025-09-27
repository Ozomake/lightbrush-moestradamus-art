import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'

const AboutPage = () => {
  // Memoize floating element properties to prevent infinite re-renders
  const floatingElements = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      key: i,
      x: [0, Math.random() * 200 - 100],
      y: [0, Math.random() * 200 - 100],
      duration: Math.random() * 25 + 20,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 120 + 80}px`,
      height: `${Math.random() * 120 + 80}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '15%'
    }))
  }, [])
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  }

  const team = [
    {
      name: "Alex Chen",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Visionary artist with 15 years in projection mapping and interactive installations."
    },
    {
      name: "Maya Rodriguez",
      role: "Technical Lead",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      bio: "Full-stack developer specializing in real-time graphics and web technologies."
    },
    {
      name: "David Kim",
      role: "Hardware Engineer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Expert in custom hardware solutions and projection system integration."
    }
  ]

  const values = [
    {
      icon: "✨",
      title: "Innovation",
      description: "We push the boundaries of what's possible, constantly exploring new technologies and creative approaches."
    },
    {
      icon: "🎨",
      title: "Artistry",
      description: "Every project is a masterpiece, combining technical excellence with artistic vision and storytelling."
    },
    {
      icon: "🤝",
      title: "Collaboration",
      description: "We work closely with clients, turning their dreams into immersive experiences that captivate audiences."
    },
    {
      icon: "🌍",
      title: "Impact",
      description: "Our installations don't just entertain—they inspire, educate, and create meaningful connections."
    }
  ]

  const timeline = [
    { year: "2020", event: "Founded Lightbrush Studio with a vision to transform spaces through light" },
    { year: "2021", event: "First major installation at Metropolitan Arts Festival draws 50K+ visitors" },
    { year: "2022", event: "Expanded internationally with projects across 15 countries" },
    { year: "2023", event: "Pioneered AI-driven projection mapping with real-time audience interaction" },
    { year: "2024", event: "Launched immersive web experiences combining WebGL with physical installations" }
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen py-20 px-6"
    >
      <div className="container mx-auto">
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-20">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            About Lightbrush
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            We are artists, engineers, and dreamers united by a single mission:
            to illuminate the world with transformative digital experiences that blur
            the boundaries between physical and virtual reality.
          </motion.p>
        </motion.div>

        {/* Story Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                Born from the intersection of cutting-edge technology and boundless creativity,
                Lightbrush Studio emerged in 2020 with a radical vision: to transform ordinary
                spaces into extraordinary experiences through the power of light and projection.
              </p>
              <p>
                What started as a passion project between three friends has evolved into a
                globally recognized studio, creating immersive installations that have amazed
                over 100,000 people across 15 countries.
              </p>
              <p>
                We believe that technology should be invisible, allowing pure emotion and
                wonder to take center stage. Every project we undertake is a canvas for
                storytelling, where light becomes our brush and space becomes our medium.
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative rounded-xl overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
              alt="Lightbrush Studio at work"
              className="w-full h-96 object-cover"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-6 right-6 text-white"
            >
              <p className="text-sm font-semibold">Behind the scenes at our studio</p>
              <p className="text-xs opacity-75">Where magic meets technology</p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Values Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                  className="text-4xl mb-4"
                >
                  {value.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10"
              >
                <div className="relative">
                  <motion.img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-blue-400 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-start space-x-6 mb-8 last:mb-0"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white"
                >
                  {item.year}
                </motion.div>
                <motion.div
                  whileHover={{ x: 10 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex-1"
                >
                  <p className="text-gray-300 leading-relaxed">{item.event}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div variants={itemVariants} className="text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
          >
            Let's Create Something Extraordinary Together
          </motion.h2>
          <motion.p
            className="text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Ready to transform your space or idea into an unforgettable experience?
            We'd love to hear from you and explore the possibilities.
          </motion.p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Button size="lg" glow>
              Start Your Project
            </Button>
            <Link to="/portfolio">
              <Button variant="outline" size="lg">
                View Our Work
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((element) => (
          <motion.div
            key={element.key}
            className="absolute opacity-5"
            animate={{
              x: element.x,
              y: element.y,
              rotate: [0, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: element.left,
              top: element.top,
              width: element.width,
              height: element.height,
              background: `linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))`,
              borderRadius: element.borderRadius,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default AboutPage