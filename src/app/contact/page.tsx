"use client";
import { useEffect, useRef, useState } from "react";
import Footer from '@/components/footer';
import { ContactForm } from '@/components/forms/contact-form';
import Navigation from '@/components/navigation';
import { Mail, Phone, MapPin, MessageCircle, FileCheck, Send, Clock, Shield, Headphones } from 'lucide-react';
import Link from 'next/link';

// Animation Hook
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isVisible] as const;
};

// Animated wrapper component
const AnimatedDiv = ({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}) => {
  const [ref, isVisible] = useScrollAnimation();

  const getTransform = () => {
    if (isVisible) return "translate-x-0 translate-y-0";

    switch (direction) {
      case "left":
        return "-translate-x-20 translate-y-0";
      case "right":
        return "translate-x-20 translate-y-0";
      case "up":
      default:
        return "translate-x-0 translate-y-10";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${getTransform()} ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Floating animation for icons
const FloatingIcon = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  return (
    <div className="animate-float" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export default function ContactPage() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <div className="min-h-screen w-full bg-gray-50 overflow-x-hidden">
      {/* Hero Section */}
      <Navigation/>
      <section className="relative py-24 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-30"
        >
          <source src="/images/video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-[1]" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 z-[2] pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/30 rounded-full animate-pulse"></div>
          <div
            className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-1/4 w-24 h-24 bg-pink-400/20 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/3 w-16 h-16 bg-cyan-400/25 rounded-full animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        <div className="relative container mx-auto px-6 xl:px-16 z-10 flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center tracking-tight drop-shadow-lg animate-fade-in-down">
            Get in Touch
          </h1>
          <p className="text-xl max-w-3xl text-center mb-6 drop-shadow animate-fade-in-up">
            Ready to bring your web project to life? Tell us about your vision and we'll provide a free consultation
          </p>
          <div className="animate-bounce mt-4">
            <Send className="w-8 h-8" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-6 xl:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto -mt-20">
            <AnimatedDiv delay={0}>
              <div className="group cursor-pointer bg-white backdrop-blur-sm border-2 border-blue-100 rounded-2xl p-6 text-center transition-all duration-300 hover:border-blue-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                  &lt;24hr
                </div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
            </AnimatedDiv>

            <AnimatedDiv delay={100}>
              <div className="group cursor-pointer bg-white backdrop-blur-sm border-2 border-purple-100 rounded-2xl p-6 text-center transition-all duration-300 hover:border-purple-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                  Free
                </div>
                <div className="text-sm text-gray-600">Consultation</div>
              </div>
            </AnimatedDiv>

            <AnimatedDiv delay={200}>
              <div className="group cursor-pointer bg-white backdrop-blur-sm border-2 border-pink-100 rounded-2xl p-6 text-center transition-all duration-300 hover:border-pink-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                  100%
                </div>
                <div className="text-sm text-gray-600">Confidential</div>
              </div>
            </AnimatedDiv>

            <AnimatedDiv delay={300}>
              <div className="group cursor-pointer bg-white backdrop-blur-sm border-2 border-cyan-100 rounded-2xl p-6 text-center transition-all duration-300 hover:border-cyan-300 hover:scale-105 hover:shadow-2xl">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <Headphones className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </AnimatedDiv>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <div className="container mx-auto px-6 xl:px-16">
          <AnimatedDiv className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 transform transition-all duration-500 hover:shadow-3xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-400/10 to-yellow-400/10 rounded-full -ml-20 -mb-20"></div>

              <div className="text-center mb-8 relative z-10">
                <FloatingIcon>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                </FloatingIcon>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Start Your Project</h2>
                <p className="text-lg text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours with a detailed proposal
                </p>
              </div>
              <ContactForm />
            </div>
          </AnimatedDiv>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 xl:px-16">
          <div className="max-w-4xl mx-auto">
            <AnimatedDiv>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">What Happens Next?</h2>
            </AnimatedDiv>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connection line for desktop */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 z-0"></div>

              <AnimatedDiv delay={0} direction="up">
                <div className="text-center relative z-10 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">1. Quick Response</h3>
                    <p className="text-gray-600">We respond to all inquiries within 24 hours</p>
                  </div>
                </div>
              </AnimatedDiv>

              <AnimatedDiv delay={150} direction="up">
                <div className="text-center relative z-10 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">2. Free Consultation</h3>
                    <p className="text-gray-600">30-minute strategy session at no cost</p>
                  </div>
                </div>
              </AnimatedDiv>

              <AnimatedDiv delay={300} direction="up">
                <div className="text-center relative z-10 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <FileCheck className="w-8 h-8 text-white" />
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-md group-hover:shadow-xl transition-all duration-300">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">3. Detailed Proposal</h3>
                    <p className="text-gray-600">Custom project plan with timeline & pricing</p>
                  </div>
                </div>
              </AnimatedDiv>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6 xl:px-16">
          <div className="max-w-6xl mx-auto">
            <AnimatedDiv>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Other Ways to Reach Us</h2>
            </AnimatedDiv>

            <div className="grid md:grid-cols-3 gap-8">
              <AnimatedDiv delay={0} direction="left">
                <div
                  className="bg-white rounded-2xl p-8 shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden group"
                  onMouseEnter={() => setActiveCard(0)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <FloatingIcon delay={0}>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 transition-colors duration-300">
                        <Mail
                          className={`w-6 h-6 transition-colors duration-300 ${
                            activeCard === 0 ? "text-white" : "text-blue-600"
                          }`}
                        />
                      </div>
                    </FloatingIcon>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Email Us</h3>
                    <a href="mailto:info@CreatorIt.com" className="text-blue-600 hover:text-blue-700 font-medium text-lg">
                      info@creatorit.com
                    </a>
                    <p className="text-gray-600 text-sm mt-2">We'll respond within 24 hours</p>
                  </div>
                </div>
              </AnimatedDiv>

              <AnimatedDiv delay={150} direction="up">
                <div
                  className="bg-white rounded-2xl p-8 shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden group"
                  onMouseEnter={() => setActiveCard(1)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <FloatingIcon delay={200}>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors duration-300">
                        <Phone
                          className={`w-6 h-6 transition-colors duration-300 ${
                            activeCard === 1 ? "text-white" : "text-blue-600"
                          }`}
                        />
                      </div>
                    </FloatingIcon>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Call Us</h3>
                    <a href="tel:+911234567890" className="text-blue-600 hover:text-blue-700 font-medium text-lg">
                      +91 9545415111
                    </a>
                    <p className="text-gray-600 text-sm mt-2">Mon-Fri, 9AM-6PM IST</p>
                  </div>
                </div>
              </AnimatedDiv>

              <AnimatedDiv delay={300} direction="right">
                <div
                  className="bg-white rounded-2xl p-8 shadow-lg text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden group"
                  onMouseEnter={() => setActiveCard(2)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <FloatingIcon delay={400}>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-500 transition-colors duration-300">
                        <MapPin
                          className={`w-6 h-6 transition-colors duration-300 ${
                            activeCard === 2 ? "text-white" : "text-blue-600"
                          }`}
                        />
                      </div>
                    </FloatingIcon>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Visit Us</h3>
                    <p className="text-gray-700 font-medium">
                      73 Pannalal Nagar,Ch.Sambhaji Nagar, India<br />India
                    </p>
                    <p className="text-gray-600 text-sm mt-2">By appointment only</p>
                  </div>
                </div>
              </AnimatedDiv>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 xl:px-16">
          <AnimatedDiv className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Have Questions?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Check out our FAQ page for quick answers to common questions
            </p>
            <Link href="/faq">
              <button className="group relative bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-2xl overflow-hidden">
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  View FAQ
                </span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
            </Link>
          </AnimatedDiv>
        </div>
      </section>
      <Footer/>

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.3s both;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}