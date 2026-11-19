import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ContactForm from "@/components/forms/ContactForm";
import { siteConfig } from "@/config/site";
import { whatsappUrl } from "@/lib/utils";
import styles from "./Contact.module.css";

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.shortName}`,
  description: "Contact A-One Foreign Employment Agency in Kandy for overseas job enquiries, recruitment guidance and international manpower requirements.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const whatsappConfigured = /^\+?[1-9][\d\s()-]*$/.test(siteConfig.whatsapp.trim())
    && /^[1-9]\d{9,14}$/.test(siteConfig.whatsapp.replace(/\D/g, ""));
  return (
    <div className={styles.page}>
      <header className={styles.hero}><div className="container-padded">
        <Breadcrumbs items={[{ label: "Contact Us" }]} className={styles.breadcrumbs} />
        <div className={styles.heroCopy}><p className={styles.eyebrow}>Contact A-One</p><h1>Your next step starts<br />with <span>a conversation.</span></h1><p>From overseas career opportunities to finding the right people for your business, connect with our recruitment team in Kandy.</p></div>
        <div className={styles.heroFootnote}><span>For candidates & international employers</span><a href="#office">Office details & opening hours <ArrowUpRight size={17} aria-hidden="true" /></a></div>
      </div></header>
      <section className={`container-padded ${styles.section}`} aria-labelledby="contact-heading">
        <div className={styles.intro}><div><p className={styles.eyebrow}>Let’s connect</p><h2 id="contact-heading">We’re here to help you<br />move forward.</h2></div><p>Ask about a vacancy, understand your next recruitment step, or discuss an employer requirement through our published contact channels.</p></div>
        <div className={styles.contactGrid}>
          <a className={styles.contactCard} href={siteConfig.phoneHref}><Phone size={23} aria-hidden="true" /><p>Speak with our team</p><h3>Give us a call</h3><span>{siteConfig.phoneDisplay} <ArrowUpRight size={18} aria-hidden="true" /></span></a>
          <a className={styles.contactCard} href={`mailto:${siteConfig.email}`}><Mail size={23} aria-hidden="true" /><p>General enquiries</p><h3>Write to A-One</h3><span>{siteConfig.email} <ArrowUpRight size={18} aria-hidden="true" /></span></a>
          {whatsappConfigured ? <a className={styles.contactCard} href={whatsappUrl(siteConfig.whatsapp)} target="_blank" rel="noopener noreferrer"><MessageCircle size={23} aria-hidden="true" /><p>Start a conversation</p><h3>Chat on WhatsApp</h3><span>Open WhatsApp <ArrowUpRight size={18} aria-hidden="true" /></span></a> : <a className={styles.contactCard} href={`mailto:${siteConfig.emailEmployers}`}><MessageCircle size={23} aria-hidden="true" /><p>International employers</p><h3>Discuss your requirements</h3><span>Contact our employer team <ArrowUpRight size={18} aria-hidden="true" /></span></a>}
        </div>
        <div className={styles.enquiryGrid}>
          <div className={styles.formPanel}><p className={styles.eyebrow}>Your enquiry</p><h2>How can we help?</h2><p className={styles.formIntro}>Tell us a little about what you’re looking for. For a live enquiry, please call or email our team.</p><ContactForm /></div>
          <aside className={styles.guide} aria-labelledby="guidance-heading"><p className={styles.eyebrow}>A little guidance</p><h2 id="guidance-heading">Find the right<br />starting point.</h2>
            <div><span>01 / For job seekers</span><h3>Explore your opportunities.</h3><p>Browse roles by destination and career field, then review the requirements for a position that interests you.</p><Link href="/jobs">Browse opportunities <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
            <div><span>02 / For employers</span><h3>Build your team with A-One.</h3><p>Explore our recruitment services and the information needed to discuss your manpower requirements.</p><Link href="/employers">Explore employer services <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
            <div><span>03 / Common questions</span><h3>Understand the process.</h3><p>Find guidance on applications, documents and the stages of overseas recruitment.</p><Link href="/faq">Read common questions <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
          </aside>
        </div>
      </section>
      <section id="office" className={styles.office} aria-labelledby="office-heading"><div className={`container-padded ${styles.officeGrid}`}>
        <div><p className={styles.eyebrow}>Visit our office</p><h2 id="office-heading">A conversation.<br />A clearer direction.</h2><p className={styles.officeIntro}>Meet our team in Kandy to discuss overseas recruitment. Call ahead to plan your visit.</p><div className={styles.address}><MapPin size={22} aria-hidden="true" /><address>{siteConfig.address.street}<br />{siteConfig.address.city}, {siteConfig.address.country}</address></div><a href={siteConfig.mapUrl} target="_blank" rel="noopener noreferrer" className={styles.primary}>Get directions <ArrowUpRight size={18} aria-hidden="true" /></a></div>
        <div className={styles.hours}><Clock size={24} aria-hidden="true" /><h3>Office opening hours</h3><dl>{siteConfig.officeHours.map(({ days, hours }) => <div key={days}><dt>{days}</dt><dd>{hours}</dd></div>)}</dl><p>Please contact us to confirm availability before travelling.</p></div>
      </div></section>
      <section className={`container-padded ${styles.closing}`} aria-label="Recruitment guidance"><div><p className={styles.eyebrow}>Know what comes next</p><h2>Make your next move with clarity.</h2></div><Link href="/how-it-works">Explore the recruitment journey <ArrowUpRight size={19} aria-hidden="true" /></Link></section>
    </div>
  );
}
