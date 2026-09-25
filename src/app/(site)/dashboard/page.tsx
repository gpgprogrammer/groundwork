import { redirect } from "next/navigation";

export default function Dashboard() {
  redirect("/lessons?chip=foryou");
}
