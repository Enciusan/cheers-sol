import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Missions() {
  return (
    <div className="flex justify-center items-center min-h-screen px-2 sm:px-4 sm:pb-0 pb-20">
      {/* <div className="absolute w-full max-w-[450px] min-h-[20rem] bg-black/10 shadow-lg rounded-xl backdrop-blur-sm"></div> */}
      <Card className="w-full max-w-[450px] min-h-[20rem] mx-auto shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-lg sm:text-xl">Missions</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <div className="w-full">Test</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
