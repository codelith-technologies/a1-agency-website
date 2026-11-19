"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2 } from "lucide-react";
import styles from "./ContactForm.module.css";

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().min(9, "Valid phone number is required"),
  email: z.string().email("Valid email address is required"),
  subject: z.string().trim().min(2, "Subject is required"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.success} role="status">
        <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-teal-600" />
        </div>
        <h3 className="text-xl font-bold text-[#0f1f3d] mb-2">Demo Form Validated</h3>
        <p className="text-sm text-slate-600 mb-6">
          Your message passed validation. This frontend demo did not transmit or store the data.
        </p>
        <button onClick={() => setSubmitted(false)} className={styles.submit}>
          Try Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={`${styles.form} space-y-4`} aria-label="Contact enquiry" aria-busy={isSubmitting}>
      <div className={styles.note}>
        <p><strong>Try the enquiry experience.</strong> Use test details. This demo checks your entries in your browser; nothing is sent or saved.</p>
      </div>
      <div>
        <label htmlFor="fullName" className="form-label">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input id="fullName" aria-required="true" aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "fullName-error" : undefined} autoComplete="name" {...register("fullName")} className="form-input" placeholder="Your name" />
        {errors.fullName && <p id="fullName-error" className="form-error" role="alert">{errors.fullName.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="form-label">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input id="phone" aria-required="true" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} type="tel" autoComplete="tel" {...register("phone")} className="form-input" placeholder="+94 7X XXX XXXX" />
          {errors.phone && <p id="phone-error" className="form-error" role="alert">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input id="email" aria-required="true" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} type="email" autoComplete="email" {...register("email")} className="form-input" placeholder="your@email.com" />
          {errors.email && <p id="email-error" className="form-error" role="alert">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="form-label">
          Subject <span className="text-red-500">*</span>
        </label>
        <input id="subject" aria-required="true" aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} {...register("subject")} className="form-input" placeholder="Inquiry subject" />
        {errors.subject && <p id="subject-error" className="form-error" role="alert">{errors.subject.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className="form-label">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea id="message" aria-required="true" aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} {...register("message")} className="form-input resize-none" rows={4} placeholder="How can we assist you?" />
        {errors.message && <p id="message-error" className="form-error" role="alert">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submit}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className={styles.spinner} aria-hidden="true" /> Validating enquiry...
          </>
        ) : (
          "Validate demo enquiry"
        )}
      </button>
      <p className={styles.footnote} role="status">Demo only. No enquiry is sent to the agency.</p>
    </form>
  );
}
