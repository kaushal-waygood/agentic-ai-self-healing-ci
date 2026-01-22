// export default ZobsCampusAmbassador;
import { Users, Target, Award, Gift, Rocket, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function ZobsCampusAmbassador() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-10 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-100 text-blue-700 px-6 py-2 rounded-full text-sm font-semibold mb-6">
              Part-time | Student Leadership Role
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Become a ZobsAI
              </span>
              <br />
              <span className="text-gray-800">Campus Ambassador</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Lead your campus community. Empower peers with AI-powered career
              tools. Build leadership skills while making a real impact.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm">
                <span className="text-purple-600 font-semibold">
                  Remote / On-Campus
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm">
                <span className="text-blue-600 font-semibold">3-6 months</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm">
                <span className="text-purple-600 font-semibold">
                  2-3 hours/week
                </span>
              </div>
            </div>

            <Link
              href="https://zobsai.com/jobs/school-ambassdor-university-campus-ambassdor-0dn7yj"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg px-12 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Apply Now on ZobsAI Platform
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students collaborating"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Build Community
              </h3>
              <p className="text-gray-600">
                Create and lead a thriving student community around career
                growth
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <img
                src="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Leadership"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Gain Leadership
              </h3>
              <p className="text-gray-600">
                Develop real-world leadership and communication skills
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <img
                src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="AI Technology"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                AI & Tech Exposure
              </h3>
              <p className="text-gray-600">
                Get hands-on experience with cutting-edge AI career tools
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              About ZobsAI
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="AI Career Platform"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                ZobsAI is an AI-powered career platform that helps students and
                early-career professionals improve their job and internship
                outcomes through intelligent profile optimization and AI-driven
                job discovery.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="font-semibold text-gray-800">Smart Matching</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <Target className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="font-semibold text-gray-800">
                    Profile Optimization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Your Role & Responsibilities
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Promote & Onboard
              </h3>
              <p className="text-gray-600">
                Promote ZobsAI among students at your campus using your unique
                referral link. Help students onboard, complete their profiles,
                and use AI-powered features.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Build Community
              </h3>
              <p className="text-gray-600">
                Build and manage a "ZobsAI @ Campus" student community through
                WhatsApp or Telegram to keep students engaged and connected.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Rocket className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Conduct Sessions
              </h3>
              <p className="text-gray-600">
                Conduct at least one career-focused micro-session per month,
                either online or offline, to share insights and tips with your
                peers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Collaborate
              </h3>
              <p className="text-gray-600">
                Collaborate with student clubs, placement cells, or peer groups
                to maximize reach and impact across campus.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Who Can Apply
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Students working together"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Current Students
                  </h3>
                  <p className="text-gray-600">
                    Current undergraduate or postgraduate students from any
                    discipline
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Strong Communicator
                  </h3>
                  <p className="text-gray-600">
                    Excellent communication and peer engagement skills
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Passionate About Tech
                  </h3>
                  <p className="text-gray-600">
                    Interest in careers, AI, or technology
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">✓</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Community Active
                  </h3>
                  <p className="text-gray-600">
                    Active in student communities or clubs (preferred, not
                    mandatory)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Perks & Benefits
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This is a performance-based role with exciting rewards and growth
              opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-9 h-9 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Official Recognition
              </h3>
              <p className="text-gray-600">
                ZobsAI Campus Ambassador Certificate and LinkedIn recommendation
                for top performers
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-9 h-9 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Premium Access
              </h3>
              <p className="text-gray-600">
                Access to premium ZobsAI tools and early access to new features
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-9 h-9 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Leadership Growth
              </h3>
              <p className="text-gray-600">
                Valuable leadership experience and startup exposure for your
                resume
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-9 h-9 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Performance-Based Compensation
              </h3>
              <p className="text-gray-600">
                Rewards based on your impact and engagement
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <Image
                  src="/Gift/3.jpg"
                  alt="Gift cards"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  width={500}
                  height={500}
                />
                <p className="font-semibold text-gray-800">Gift Cards</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <Image
                  src="/Gift/1.jpg"
                  alt="Hoodies"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  width={500}
                  height={500}
                />
                <p className="font-semibold text-gray-800">Branded Hoodies</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <Image
                  src="/Gift/2.jpg"
                  alt="Water bottles"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  width={500}
                  height={500}
                />
                <p className="font-semibold text-gray-800">Water Bottles</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <Image
                  src="/Gift/4.jpg"
                  alt="Tech products"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  width={500}
                  height={500}
                />
                <p className="font-semibold text-gray-800">Tech Products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-10 rounded-3xl shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Selection & Performance
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6"></div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md mb-8">
              <p className="text-lg text-gray-700 leading-relaxed text-center">
                This is a non-salaried, performance-based ambassador role. Your
                performance is tracked based on student onboarding, community
                engagement, and consistency in executing your responsibilities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  Track
                </div>
                <p className="text-gray-600">Student Onboarding</p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  Measure
                </div>
                <p className="text-gray-600">Community Engagement</p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  Reward
                </div>
                <p className="text-gray-600">Consistent Performance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Lead and Make an Impact?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            If you enjoy leadership, community building, and helping peers with
            career growth using AI, this role is perfect for you. Join the
            ZobsAI Campus Ambassador community today!
          </p>

          <Link
            href="https://zobsai.com/jobs/school-ambassdor-university-campus-ambassdor-0dn7yj"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-blue-600 font-bold text-lg px-12 py-5 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:bg-gray-50"
          >
            Apply Now on ZobsAI Platform
          </Link>

          <p className="text-blue-100 mt-8 text-sm">
            Applications are reviewed on a rolling basis
          </p>
        </div>
      </section>
    </div>
  );
}

export default ZobsCampusAmbassador;
