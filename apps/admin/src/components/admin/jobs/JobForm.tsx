"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  insertAdminJob,
  listAdminJobOptions,
  updateAdminJob,
  type AdminJob,
  type JobPayload,
} from "@a1/database";
import { FormSection, Field, Input, Textarea, Select } from "@/components/admin/ui";

const schema = z.object({
  title: z.string().trim().min(3, "Minimum 3 characters").max(120),
  reference: z.string().trim().min(1, "Reference required").max(40),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  countryId: z.string().min(1, "Select a country"),
  categoryId: z.string().min(1, "Select a category"),
  employerName: z.string().trim().min(2, "Employer name required").max(160),
  city: z.string().trim().max(120).optional(),
  salaryMin: z.coerce.number().int().min(0).optional().or(z.literal("")),
  salaryMax: z.coerce.number().int().min(0).optional().or(z.literal("")),
  vacancyCount: z.coerce.number().int().min(1, "At least 1 vacancy"),
  minimumAge: z.coerce.number().int().min(15).max(100).optional().or(z.literal("")),
  maximumAge: z.coerce.number().int().min(15).max(100).optional().or(z.literal("")),
  employmentType: z.enum(["full-time", "contract", "temporary"]),
  experienceLevel: z.enum(["no-experience", "entry", "mid", "senior"]),
  experienceRequirements: z.string().max(1000).optional(),
  description: z.string().trim().min(20, "Minimum 20 characters"),
  responsibilities: z.array(z.object({ value: z.string().trim().min(2, "Enter a responsibility") })).min(1),
  qualifications: z.array(z.object({ value: z.string().trim() })).optional(),
  benefits: z.array(z.object({ value: z.string().trim() })).optional(),
  accommodation: z.string().max(300).optional(),
  food: z.string().max(300).optional(),
  transportation: z.string().max(300).optional(),
  medical: z.string().max(300).optional(),
  insurance: z.string().max(300).optional(),
  workingHours: z.string().max(300).optional(),
  contractDuration: z.string().max(300).optional(),
  closingDate: z.string().optional(),
  interviewInformation: z.string().max(2000).optional(),
  otherConditions: z.string().max(2000).optional(),
  featured: z.boolean().optional(),
  tags: z.string().optional(),
}).superRefine((value, context) => {
  if (typeof value.salaryMin === "number" && typeof value.salaryMax === "number" && value.salaryMin > value.salaryMax) {
    context.addIssue({ code: "custom", path: ["salaryMax"], message: "Maximum salary must be at least the minimum" });
  }
  if (typeof value.minimumAge === "number" && typeof value.maximumAge === "number" && value.minimumAge > value.maximumAge) {
    context.addIssue({ code: "custom", path: ["maximumAge"], message: "Maximum age must be at least the minimum" });
  }
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

function optionalNumber(value: number | "" | undefined): number | null {
  return typeof value === "number" ? value : null;
}

export function JobForm({ initialJob }: { initialJob?: AdminJob }) {
  const router = useRouter();
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialJob?.title ?? "",
      reference: initialJob?.reference ?? "",
      slug: initialJob?.slug ?? "",
      countryId: initialJob?.country_id ?? "",
      categoryId: initialJob?.category_id ?? "",
      employerName: initialJob?.employer_name ?? "",
      city: initialJob?.city ?? "",
      salaryMin: initialJob?.salary_min ?? "",
      salaryMax: initialJob?.salary_max ?? "",
      vacancyCount: initialJob?.vacancy_count ?? 1,
      minimumAge: initialJob?.minimum_age ?? "",
      maximumAge: initialJob?.maximum_age ?? "",
      employmentType: initialJob?.employment_type ?? "full-time",
      experienceLevel: initialJob?.experience_level ?? "no-experience",
      experienceRequirements: initialJob?.experience_requirements ?? "",
      description: initialJob?.description ?? "",
      responsibilities: (initialJob?.responsibilities?.length ? initialJob.responsibilities : [""]).map(value => ({ value })),
      qualifications: (initialJob?.qualifications?.length ? initialJob.qualifications : []).map(value => ({ value })),
      benefits: (initialJob?.benefits?.length ? initialJob.benefits : []).map(value => ({ value })),
      accommodation: initialJob?.accommodation ?? "",
      food: initialJob?.food ?? "",
      transportation: initialJob?.transportation ?? "",
      medical: initialJob?.medical ?? "",
      insurance: initialJob?.insurance ?? "",
      workingHours: initialJob?.working_hours ?? "",
      contractDuration: initialJob?.contract_duration ?? "",
      closingDate: initialJob?.closing_date ?? "",
      interviewInformation: initialJob?.interview_information ?? "",
      otherConditions: initialJob?.other_conditions ?? "",
      featured: initialJob?.featured ?? false,
      tags: initialJob?.tags?.join(", ") ?? "",
    },
  });
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = form;
  const responsibilities = useFieldArray({ control, name: "responsibilities" });
  const qualifications = useFieldArray({ control, name: "qualifications" });
  const benefits = useFieldArray({ control, name: "benefits" });

  useEffect(() => {
    let active = true;
    void listAdminJobOptions().then((result) => {
      if (!active) return;
      setCountries(result.countries);
      setCategories(result.categories);
      setOptionsError(result.error);
    });
    return () => { active = false; };
  }, []);

  const save = async (data: FormData) => {
    setSaveError(null);
    setSaved(false);
    if (!countries.some(option => option.id === data.countryId) || !categories.some(option => option.id === data.categoryId)) {
      setSaveError("Reload country and category options before saving.");
      return;
    }
    const payload: JobPayload = {
      reference: data.reference,
      slug: data.slug,
      title: data.title,
      country_id: data.countryId,
      category_id: data.categoryId,
      employer_name: data.employerName,
      city: data.city || null,
      salary_min: optionalNumber(data.salaryMin),
      salary_max: optionalNumber(data.salaryMax),
      currency: "LKR",
      minimum_age: optionalNumber(data.minimumAge),
      maximum_age: optionalNumber(data.maximumAge),
      vacancy_count: data.vacancyCount,
      employment_type: data.employmentType,
      experience_level: data.experienceLevel,
      experience_requirements: data.experienceRequirements || null,
      description: data.description,
      responsibilities: data.responsibilities.map(item => item.value).filter(Boolean),
      qualifications: (data.qualifications ?? []).map(item => item.value).filter(Boolean),
      benefits: (data.benefits ?? []).map(item => item.value).filter(Boolean),
      accommodation: data.accommodation || null,
      food: data.food || null,
      transportation: data.transportation || null,
      medical: data.medical || null,
      insurance: data.insurance || null,
      working_hours: data.workingHours || null,
      contract_duration: data.contractDuration || null,
      closing_date: data.closingDate || null,
      interview_information: data.interviewInformation || null,
      other_conditions: data.otherConditions || null,
      featured: data.featured ?? false,
      tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      status: initialJob?.status === "closed" || initialJob?.status === "archived"
        ? initialJob.status
        : "draft",
      published_at: null,
    };

    if (initialJob) {
      const result = await updateAdminJob(initialJob.id, initialJob.updated_at, payload);
      if (result.error) setSaveError(result.error);
      else {
        setSaved(true);
        router.refresh();
      }
    } else {
      const result = await insertAdminJob(payload);
      if (result.error) setSaveError(result.error);
      else {
        setSaved(true);
        router.replace("/jobs");
      }
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/jobs" className="text-slate-400 transition hover:text-navy-700"><ArrowLeft className="size-5" /></Link>
        <h1 className="text-xl font-bold text-navy-900">{initialJob ? "Edit Job Vacancy" : "Post New Job Vacancy"}</h1>
      </div>
      {optionsError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{optionsError}</div>}
      {saveError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div>}
      {saved && <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">Job saved successfully.</div>}
      <form onSubmit={handleSubmit(save)} className="space-y-5">
        <FormSection title="Basic Information" description="Internal recruitment details.">
          <Field id="title" label="Job Title" required error={errors.title?.message} fullWidth><Input id="title" {...register("title")} error={!!errors.title} /></Field>
          <Field id="reference" label="Reference No." required error={errors.reference?.message}><Input id="reference" {...register("reference")} error={!!errors.reference} /></Field>
          <Field id="slug" label="URL Slug" required error={errors.slug?.message}><Input id="slug" {...register("slug")} error={!!errors.slug} /></Field>
          <Field id="employerName" label="Employer Name" required error={errors.employerName?.message}><Input id="employerName" {...register("employerName")} error={!!errors.employerName} /></Field>
          <Field id="countryId" label="Destination Country" required error={errors.countryId?.message}>
            <Select id="countryId" placeholder="Select country…" options={countries.map(item => ({ value: item.id, label: item.name }))} {...register("countryId")} error={!!errors.countryId} />
          </Field>
          <Field id="categoryId" label="Job Category" required error={errors.categoryId?.message}>
            <Select id="categoryId" placeholder="Select category…" options={categories.map(item => ({ value: item.id, label: item.name }))} {...register("categoryId")} error={!!errors.categoryId} />
          </Field>
          <Field id="city" label="City / Region"><Input id="city" {...register("city")} /></Field>
          <Field id="employmentType" label="Employment Type" required>
            <Select id="employmentType" options={[{ value:"full-time",label:"Full Time"},{value:"contract",label:"Contract"},{value:"temporary",label:"Temporary"}]} {...register("employmentType")} />
          </Field>
          <Field id="experienceLevel" label="Experience Level" required>
            <Select id="experienceLevel" options={[{value:"no-experience",label:"No Experience"},{value:"entry",label:"Entry"},{value:"mid",label:"Mid"},{value:"senior",label:"Senior"}]} {...register("experienceLevel")} />
          </Field>
          <Field id="experienceRequirements" label="Experience Requirements" fullWidth><Textarea id="experienceRequirements" rows={2} {...register("experienceRequirements")} /></Field>
        </FormSection>
        <FormSection title="Salary & Eligibility">
          <Field id="vacancyCount" label="Number of Vacancies" required error={errors.vacancyCount?.message}><Input id="vacancyCount" type="number" min={1} {...register("vacancyCount")} error={!!errors.vacancyCount} /></Field>
          <Field id="salaryMin" label="Minimum Salary (LKR)" error={errors.salaryMin?.message}><Input id="salaryMin" type="number" min={0} {...register("salaryMin")} /></Field>
          <Field id="salaryMax" label="Maximum Salary (LKR)" error={errors.salaryMax?.message}><Input id="salaryMax" type="number" min={0} {...register("salaryMax")} /></Field>
          <Field id="minimumAge" label="Minimum Age" error={errors.minimumAge?.message}><Input id="minimumAge" type="number" min={15} max={100} {...register("minimumAge")} /></Field>
          <Field id="maximumAge" label="Maximum Age" error={errors.maximumAge?.message}><Input id="maximumAge" type="number" min={15} max={100} {...register("maximumAge")} /></Field>
          <Field id="closingDate" label="Closing Date"><Input id="closingDate" type="date" {...register("closingDate")} /></Field>
          <Field id="featured" label="Featured Job"><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("featured")} /> Feature this vacancy</label></Field>
        </FormSection>
        <FormSection title="Job Description" columns={1}>
          <Field id="description" label="Description" required error={errors.description?.message} fullWidth><Textarea id="description" rows={5} {...register("description")} error={!!errors.description} /></Field>
          <div className="col-span-full space-y-2">
            <p className="text-xs font-medium">Responsibilities</p>
            {responsibilities.fields.map((field, index) => <div key={field.id} className="flex gap-2"><Input {...register(`responsibilities.${index}.value`)} />{responsibilities.fields.length > 1 && <button type="button" onClick={() => responsibilities.remove(index)}><Trash2 className="size-4" /></button>}</div>)}
            <button type="button" onClick={() => responsibilities.append({ value: "" })} className="flex items-center gap-1 text-xs"><Plus className="size-3" /> Add responsibility</button>
          </div>
        </FormSection>
        <FormSection title="Qualifications, Benefits & Conditions" columns={1}>
          <div className="space-y-2"><p className="text-xs font-medium">Qualifications</p>{qualifications.fields.map((field,index)=><div key={field.id} className="flex gap-2"><Input {...register(`qualifications.${index}.value`)} /><button type="button" onClick={()=>qualifications.remove(index)}><Trash2 className="size-4" /></button></div>)}<button type="button" onClick={()=>qualifications.append({value:""})} className="flex items-center gap-1 text-xs"><Plus className="size-3" /> Add qualification</button></div>
          <div className="space-y-2"><p className="text-xs font-medium">Benefits</p>{benefits.fields.map((field,index)=><div key={field.id} className="flex gap-2"><Input {...register(`benefits.${index}.value`)} /><button type="button" onClick={()=>benefits.remove(index)}><Trash2 className="size-4" /></button></div>)}<button type="button" onClick={()=>benefits.append({value:""})} className="flex items-center gap-1 text-xs"><Plus className="size-3" /> Add benefit</button></div>
          <Field id="accommodation" label="Accommodation"><Input id="accommodation" {...register("accommodation")} /></Field>
          <Field id="food" label="Food"><Input id="food" {...register("food")} /></Field>
          <Field id="transportation" label="Transportation"><Input id="transportation" {...register("transportation")} /></Field>
          <Field id="medical" label="Medical"><Input id="medical" {...register("medical")} /></Field>
          <Field id="insurance" label="Insurance"><Input id="insurance" {...register("insurance")} /></Field>
          <Field id="workingHours" label="Working Hours"><Input id="workingHours" {...register("workingHours")} /></Field>
          <Field id="contractDuration" label="Contract Duration"><Input id="contractDuration" {...register("contractDuration")} /></Field>
          <Field id="interviewInformation" label="Interview Information" fullWidth><Textarea id="interviewInformation" rows={3} {...register("interviewInformation")} /></Field>
          <Field id="otherConditions" label="Other Conditions" fullWidth><Textarea id="otherConditions" rows={3} {...register("otherConditions")} /></Field>
          <Field id="tags" label="Tags" fullWidth><Input id="tags" placeholder="driving, overseas" {...register("tags")} /></Field>
        </FormSection>
        <div className="flex items-center justify-between">
          <Link href="/jobs" className="text-sm text-slate-500">← Cancel</Link>
          <button type="submit" disabled={isSubmitting || !!optionsError || !countries.length || !categories.length} className="flex items-center gap-2 rounded-lg bg-navy-800 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}{isSubmitting ? "Saving…" : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
