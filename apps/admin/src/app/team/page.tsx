import type { Metadata } from "next";
import { TeamClient } from "./TeamClient";

export const metadata: Metadata = { title: "Team Members" };

export default function TeamPage() {
  return <TeamClient />;
}
