import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Users, Shield, Award, Target, Eye } from 'lucide-react'
import DeveloperCredit from '../../components/common/DeveloperCredit'

const AboutPage = () => {
  const stats = [
    { number: '10,000+', label: 'Patients Served' },
    { number: '500+', label: 'Healthcare Providers' },
    { number: '50+', label: 'Specialties' },
    { number: '24/7', label: 'Support Available' }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Patient-Centered Care',
      description: 'We put patients at the heart of everything we do, ensuring personalized and compassionate healthcare experiences.'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'Your health information is protected with the highest standards of security and privacy compliance.'
    },
    {
      icon: Award,
      title: 'Excellence in Service',
      description: 'We strive for excellence in every interaction, continuously improving our services and technology.'
    },
    {
      icon: Eye,
      title: 'Accessible Healthcare',
      description: 'Making quality healthcare accessible to everyone, anywhere, through innovative digital solutions.'
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              About{' '}
              <span className="text-accent-400">Oxiwell</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Transforming healthcare through innovative technology and compassionate care. 
              We're dedicated to making quality healthcare accessible, efficient, and patient-centered.
            </motion.p>
            
            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm md:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Our Mission
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              To revolutionize healthcare delivery by providing cutting-edge digital solutions that 
              connect patients, healthcare providers, and medical institutions in a seamless, secure, 
              and efficient ecosystem. We believe that technology should enhance the human touch in 
              healthcare, not replace it.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-900 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Our Values
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              These core values guide everything we do and shape our commitment to excellence in healthcare technology.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon
              return (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-8 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-br from-primary-800 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-300">
                  Founded in 2020 by a team of healthcare professionals and technology experts, 
                  Oxiwell was born from a simple observation: healthcare systems were becoming 
                  increasingly complex, but patient care was getting lost in the process.
                </p>
                <p className="text-lg text-gray-300">
                  We started with a vision to create a platform that would put patients back 
                  at the center of healthcare, while empowering providers with the tools they 
                  need to deliver exceptional care efficiently.
                </p>
                <p className="text-lg text-gray-300">
                  Today, we're proud to serve thousands of patients and hundreds of healthcare 
                  providers, continuously innovating to make healthcare more accessible, 
                  transparent, and effective for everyone.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-center text-white">
                <Target className="w-16 h-16 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Available 24/7</h3>
                <p className="text-lg opacity-90">
                  Our platform is always available when you need it most. 
                  Access your health information, book appointments, and 
                  connect with healthcare providers anytime, anywhere.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-secondary-900 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Meet Our Leadership Team
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Passionate healthcare and technology experts dedicated to transforming the healthcare experience.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Healthcare Leadership',
                role: 'Executive Team',
                bio: 'Experienced healthcare professionals dedicated to improving patient care through technology.',
                image: null
              },
              {
                name: 'Technology Experts',
                role: 'Development Team',
                bio: 'Software engineers and architects specializing in secure healthcare systems and user experience.',
                image: null
              },
              {
                name: 'Medical Professionals',
                role: 'Clinical Advisory',
                bio: 'Board-certified physicians providing clinical guidance and ensuring medical accuracy.',
                image: null
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-primary-800 to-primary-700 rounded-xl p-8 border border-primary-600 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-accent-400 font-medium mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <DeveloperCredit />
    </>
  )
}

export default AboutPage
