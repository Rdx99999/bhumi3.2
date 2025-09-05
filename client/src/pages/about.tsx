import { Card, CardContent } from "@/components/ui/card";
import { FaUserTie, FaAward, FaCertificate, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect } from "react";
import SEO from "@/components/SEO/SEO";

export default function AboutUs() {
  // Scroll to top when navigating to this page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Special animation for stats counter
  const counterVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (custom: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: custom * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO for About page */}
      <SEO
        title="About Us | Professional Consultancy Experts | Bhumi Consultancy Services"
        description="Learn about Bhumi Consultancy Services - experienced business consultants providing professional training programs, audit services, and certification solutions to help businesses grow."
        keywords="about bhumi consultancy, professional consultants, business consulting experts, training program specialists, audit services, certification providers"
        canonicalUrl="https://bhumiconsultancy.in/about"
        structuredData={{
          type: 'organization',
          data: {
            name: 'Bhumi Consultancy Services',
            url: 'https://bhumiconsultancy.in',
            logo: 'https://bhumiconsultancy.in/favicon.png',
            description: 'Professional business consulting, training programs, and certification services with years of industry experience.',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'MCF-6503, Sanjay Colony, Sector-23, 33 Feet Road, Near Rana Aata Chakki',
              addressLocality: 'Faridabad',
              addressRegion: 'Haryana',
              postalCode: '121005',
              addressCountry: 'IN'
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+91 7827284027',
              contactType: 'customer service',
              email: 'bcs04062013@gmail.com',
              areaServed: 'IN',
              availableLanguage: ['en', 'hi']
            },
            founder: {
              '@type': 'Person',
              name: 'Veerarjun Upadhyay'
            },
            socialMedia: [
              'https://www.facebook.com/share/19gk3NuZ5F/',
              'https://x.com/veerupyy?t=3j_t11dcqUTDxbptxjEw_w&s=09',
              'https://www.linkedin.com/in/veerarjun-upadhyay-a41001313',
              'https://www.instagram.com/veerarjunupadhyay?igsh=MXA5bmtkNHZlbmV5eg=='
            ]
          }
        }}
      />
      {/* Hero Section */}
      <motion.section
        className="bg-primary text-white py-12 sm:py-16 md:py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
            }}
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              About Bhumi Consultancy Services
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg md:text-xl opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              We are a Faridabad, Haryana based consultancy firm specialized in
              ISO certifications, customer audits, VDA audits, and recruitment
              services for the automotive and non automotive industrial sectors.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Our Story */}
      <motion.section
        className="py-12 sm:py-16 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6 text-center"
              variants={fadeIn}
            >
              Our Story
            </motion.h2>
            <motion.div
              className="bg-white rounded-lg shadow-md p-6 sm:p-8 md:p-10 mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.p
                className="text-gray-700 mb-4 text-responsive"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Founded with a vision to elevate quality standards in the
                automotive industry, Bhumi Consultancy began with the mission to
                help manufacturers achieve excellence in international
                certifications and audits.
              </motion.p>
              <motion.p
                className="text-gray-700 mb-4 text-responsive"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Our journey began in the automotive sector, where we established
                strong partnerships with major OEMs and tier-one suppliers.
                Through years of dedicated service and proven results, we've
                built a reputation for excellence in VDA audits and ISO
                certifications, consistently achieving Green ratings for our
                clients.
              </motion.p>
              <motion.p
                className="text-gray-700 text-responsive"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Today, we have expanded our services to include recruitment
                solutions, providing over 3,500 qualified candidates to
                companies in the automotive and industrial sectors. We've helped
                88+ companies achieve and maintain Green Zone ratings, and
                successfully completed 100+ customer audits with some of the
                industry's most demanding clients.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Core Values */}
      <motion.section
        className="py-12 sm:py-16 md:py-20 bg-gray-100"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-10 text-center"
            variants={fadeIn}
          >
            Our Core Values
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            variants={staggerContainer}
          >
            <motion.div variants={fadeIn} whileHover={{ y: -10 }}>
              <Card className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 h-full">
                <CardContent className="p-6 sm:p-8 text-center">
                  <motion.div
                    className="bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FaUserTie size={28} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    ISO Certification
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base">
                    ISO 9001:2015, ISO 14001:2015, ISO 45001:2018, IATF
                    16949:2016 certification expertise.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn} whileHover={{ y: -10 }}>
              <Card className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 h-full">
                <CardContent className="p-6 sm:p-8 text-center">
                  <motion.div
                    className="bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <FaAward size={28} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    Customer Audit
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Comprehensive customer audit preparation and documentation
                    services to meet industry standards.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn} whileHover={{ y: -10 }}>
              <Card className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 h-full">
                <CardContent className="p-6 sm:p-8 text-center">
                  <motion.div
                    className="bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <FaCertificate size={28} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    VDA Audit
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Successfully passed VDA Audit for major automotive companies
                    like Volkswagen, AMG, Navistar with Green ratings.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn} whileHover={{ y: -10 }}>
              <Card className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 h-full">
                <CardContent className="p-6 sm:p-8 text-center">
                  <motion.div
                    className="bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                    whileHover={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: 0 }}
                  >
                    <FaChartLine size={28} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    Recruitment Services
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Specialized manpower solutions and technical recruitment
                    services for automotive and industrial sectors.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        className="py-12 sm:py-16 md:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-10 text-center"
            variants={fadeIn}
          >
            Our Team
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
          >
            {/* Team Member 1 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ translateY: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <motion.div
                className="h-48 sm:h-56 bg-gray-300 flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="https://huggingface.co/Aman6u5/ddddttyyuu/resolve/main/image%2520(3).png?download=true"
                  alt="Managing Director"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-bold text-primary mb-1">
                  Veer Arjun Upadhyay
                </h3>
                <p className="text-yellow-600 font-medium mb-3">
                  Managing Director
                </p>
                <p className="text-gray-700 text-sm sm:text-base">
                  Leading our team with vision and expertise, Mr. Upadhyay
                  oversees all business activities of the organization with a
                  focus on excellence.
                </p>
              </div>
            </motion.div>

            {/* Team Member 2 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ translateY: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <motion.div
                className="h-48 sm:h-56 bg-gray-300 flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="https://huggingface.co/Aman6u5/ddddttyyuu/resolve/main/WhatsApp%20Image%202025-08-03%20at%208.54.14%20PM%20(1).jpeg?download=true"
                  alt="CEO"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-bold text-primary mb-1">
                  Poonam Upadhyay
                </h3>
                <p className="text-yellow-600 font-medium mb-3">
                  Chief Executive Officer
                </p>
                <p className="text-gray-700 text-sm sm:text-base">
                  Mrs. Upadhyay ensures operational excellence and quality
                  service delivery across all our consultancy projects.
                </p>
              </div>
            </motion.div>

            {/* Team Member 3 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ translateY: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <motion.div
                className="h-48 sm:h-56 bg-gray-300 flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="https://huggingface.co/Aman6u5/ddddttyyuu/resolve/main/out.jpg?download=true"
                  alt="Training Director"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-bold text-primary mb-1">
                  Vinod Kumar Tiwari
                </h3>
                <p className="text-yellow-600 font-medium mb-3">
                  Head of Training Department
                </p>
                <p className="text-gray-700 text-sm sm:text-base">
                  Mr. Tiwari leads our specialized training department providing
                  behavioral, technical, and management system training with a
                  focus on industrial best practices.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-12 sm:py-16 md:py-20 bg-primary text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center"
            variants={staggerContainer}
          >
            <motion.div
              custom={0}
              variants={counterVariants}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <motion.div
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
              >
                82+
              </motion.div>
              <p className="text-sm sm:text-base">New Clients</p>
            </motion.div>
            <motion.div
              custom={1}
              variants={counterVariants}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <motion.div
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              >
                100+
              </motion.div>
              <p className="text-sm sm:text-base">Customer Audits</p>
            </motion.div>
            <motion.div
              custom={2}
              variants={counterVariants}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <motion.div
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
              >
                88+
              </motion.div>
              <p className="text-sm sm:text-base">Companies in Green Zone</p>
            </motion.div>
            <motion.div
              custom={3}
              variants={counterVariants}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <motion.div
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
              >
                3500+
              </motion.div>
              <p className="text-sm sm:text-base">Candidates Provided</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
