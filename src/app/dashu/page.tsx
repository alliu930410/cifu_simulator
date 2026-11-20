import type { Metadata } from "next";
import DashuCalculator from "@/components/DashuCalculator";

export const metadata: Metadata = {
  title: "打书概率",
  description: "梦幻西游宝宝打书概率计算器",
};

export default function DashuPage() {
  return <DashuCalculator />;
}
