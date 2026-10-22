import type { Metadata } from "next";
import { countries } from "@/data";
import { CountriesClient } from "./CountriesClient";

export const metadata: Metadata = { title: "Destination Countries" };

export default function CountriesPage() {
  return <CountriesClient initialCountries={countries} />;
}
