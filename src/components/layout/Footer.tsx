import { motion } from 'framer-motion'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 bg-black/20 backdrop-blur-md border-t border-white/10 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-3 mb-4"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm transform rotate-12"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Lightbrush
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-400 text-sm leading-relaxed max-w-md"
            >
              Illuminating digital experiences through innovative projection mapping,
              interactive installations, and immersive web technologies.
              Where light meets code, magic happens.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex space-x-4 mt-6"
            >
              {['GitHub', 'LinkedIn', 'Twitter', 'Instagram'].map((platform) => (
                <motion.a
                  key={platform}
                  href="#"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center hover:from-blue-500/40 hover:to-purple-600/40 transition-colors duration-300"
                >
                  <span className="text-sm font-semibold text-gray-300">
                    {platform.slice(0, 2).toUpperCase()}
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Contact Info */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white font-semibold mb-4"
            >
              Get in Touch
            </motion.h3>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3 text-gray-400 text-sm"
            >
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-500/20 rounded flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-blue-400 rounded"></div>
                </div>
                <div>
                  <p>hello@lightbrush.studio</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-purple-500/20 rounded flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-purple-400 rounded"></div>
                </div>
                <div>
                  <p>San Francisco, CA</p>
                  <p className="text-xs text-gray-500">Available worldwide</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-white font-semibold mb-4"
            >
              Explore
            </motion.h3>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-2 text-gray-400 text-sm"
            >
              {[
                { label: 'Interactive Experience', href: '/game' },
                { label: 'Portfolio Gallery', href: '/portfolio' },
                { label: 'About Lightbrush', href: '/about' },
                { label: 'Contact', href: '/#contact' },
              ].map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  whileHover={{ x: 4, color: '#ffffff' }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="block hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="pt-8 mt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-500 text-sm">
            © {currentYear} Lightbrush Studio. All rights reserved.
          </p>

          <div className="flex space-x-6 mt-4 md:mt-0">
            {['Privacy Policy', 'Terms of Service', 'Cookies'].map((item) => (
              <motion.a
                key={item}
                href="#"
                whileHover={{ color: '#ffffff' }}
                className="text-gray-500 text-sm hover:text-white transition-colors duration-200"
              >
                {item}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Animated gradient line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </footer>
  )
}

export default Footer