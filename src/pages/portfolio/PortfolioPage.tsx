import { motion } from 'framer-motion'
import { useState, Suspense, useMemo } from 'react'
import Button from '../../components/ui/Button'
import ProjectShowcase3D from '../../components/3d/ProjectShowcase3D'

const PortfolioPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Memoize floating element properties to prevent infinite re-renders
  const floatingElements = useMemo(() => {
    return [...Array(6)].map((_, i) => ({
      key: i,
      x: [0, Math.random() * 200 - 100],
      y: [0, Math.random() * 200 - 100],
      duration: Math.random() * 20 + 15,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 150 + 100}px`,
      height: `${Math.random() * 150 + 100}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '20%'
    }))
  }, [])

  const categories = [
    { id: 'all', name: 'All Projects' },
    { id: 'projection', name: 'Projection Mapping' },
    { id: 'interactive', name: 'Interactive Installations' },
    { id: 'web', name: 'Web Experiences' },
    { id: 'art', name: 'Digital Art' }
  ]

  const projects = [
    {
      id: 1,
      title: "Urban Canvas",
      category: "projection",
      description: "Large-scale building projection mapping for city festival",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop",
      year: "2024",
      client: "Metropolitan Arts Council",
      tech: ["TouchDesigner", "MadMapper", "Custom Hardware"]
    },
    {
      id: 2,
      title: "Interactive Soundscape",
      category: "interactive",
      description: "Motion-responsive audio-visual installation",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
      year: "2023",
      client: "Modern Art Museum",
      tech: ["Kinect", "Max/MSP", "LED Arrays"]
    },
    {
      id: 3,
      title: "Digital Constellation",
      category: "web",
      description: "WebGL-powered immersive space exploration",
      image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
      year: "2024",
      client: "Space Science Center",
      tech: ["Three.js", "WebGL", "React"]
    },
    {
      id: 4,
      title: "Liquid Geometries",
      category: "art",
      description: "Generative art series exploring fluid dynamics",
      image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=600&fit=crop",
      year: "2023",
      client: "Digital Gallery",
      tech: ["Processing", "AI Algorithms", "Real-time Rendering"]
    },
    {
      id: 5,
      title: "Holographic Theater",
      category: "projection",
      description: "360-degree immersive theatrical experience",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
      year: "2024",
      client: "Experimental Theater Co.",
      tech: ["Hologram Technology", "Spatial Audio", "Motion Tracking"]
    },
    {
      id: 6,
      title: "Neural Network Visualization",
      category: "interactive",
      description: "Real-time AI model visualization installation",
      image: "https://images.unsplash.com/photo-1485796826113-174aa68fd81b?w=800&h=600&fit=crop",
      year: "2023",
      client: "Tech Innovation Hub",
      tech: ["TensorFlow", "Custom Visualization", "Touch Interface"]
    }
  ]

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(project => project.category === selectedCategory)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen py-20 px-6"
    >
      <div className="container mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Our Portfolio
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Discover our collection of immersive experiences, from large-scale projection mappings
            to intimate interactive installations that blur the line between physical and digital.
          </motion.p>
        </motion.div>

        {/* 3D Portfolio Showcase - temporarily disabled for debugging */}
        {/* <motion.div variants={itemVariants} className="mb-16">
          <Suspense fallback={
            <div className="flex items-center justify-center h-[70vh]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" as const }}
                className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          }>
            <ProjectShowcase3D projects={projects.map((project, index) => ({
              title: project.title,
              description: project.description,
              color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'][index % 6]
            }))} />
          </Suspense>
        </motion.div> */}

        {/* Category Filter */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {category.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              layout
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500"
            >
              {/* Project Image */}
              <div className="relative h-64 overflow-hidden">
                <motion.img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="absolute bottom-4 left-4 right-4"
                >
                  <div className="flex items-center justify-between text-white">
                    <span className="text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">
                      {project.year}
                    </span>
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  </div>
                </motion.div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                    {project.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    project.category === 'projection' ? 'bg-blue-500/20 text-blue-400' :
                    project.category === 'interactive' ? 'bg-purple-500/20 text-purple-400' :
                    project.category === 'web' ? 'bg-green-500/20 text-green-400' :
                    'bg-pink-500/20 text-pink-400'
                  }`}>
                    {categories.find(cat => cat.id === project.category)?.name.split(' ')[0]}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  {project.description}
                </p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">CLIENT</p>
                  <p className="text-sm text-gray-300">{project.client}</p>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-2">TECHNOLOGIES</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="text-xs bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="outline" className="w-full group-hover:bg-blue-500/10 group-hover:border-blue-500/50">
                    Explore Project
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-20"
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
          >
            Ready to Create Something Amazing?
          </motion.h2>
          <motion.p
            className="text-gray-300 mb-8 max-w-2xl mx-auto"
          >
            Let's collaborate to bring your vision to life with cutting-edge projection mapping
            and immersive digital experiences.
          </motion.p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" glow>
              Start Your Project
            </Button>
            <Button variant="outline" size="lg">
              Schedule a Consultation
            </Button>
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
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "linear" as const
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

export default PortfolioPage