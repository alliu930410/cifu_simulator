import type { Metadata } from "next";
import JinjieSimulator from "@/components/JinjieSimulator";

export const metadata: Metadata = {
  title: "进阶模拟器",
  description: "梦幻西游召唤兽进阶：开清灵净瓶、吃仙露冲灵性",
};

export default function JinjiePage() {
  return <JinjieSimulator />;
}
