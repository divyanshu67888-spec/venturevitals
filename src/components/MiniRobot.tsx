import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";

interface MiniRobotProps {
  className?: string;
}

const MiniRobot = ({ className }: MiniRobotProps) => {
  return (
    <div 
      className={cn(
        "w-full h-[320px] md:h-[500px] relative overflow-hidden",
        className
      )}
    >
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <SplineScene 
        scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
        className="w-full h-full"
      />
    </div>
  );
};

export default MiniRobot;
