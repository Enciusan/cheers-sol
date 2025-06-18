import { COMMUNITIES } from "@/utils/communities";
import { DrinkIcon } from "@/utils/drinks";
import { Info } from "lucide-react";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogTrigger,
} from "../ui/morphing-dialog";

export const MatchInfo = (props: any) => {
  const { data } = props;

  return (
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.25,
      }}>
      <MorphingDialogTrigger
        style={{
          borderRadius: "12px",
        }}
        className="flex max-w-[270px] flex-col overflow-hidden border border-zinc-50/10 bg-zinc-900">
        <Info className="w-6 h-6 cursor-pointer" />
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent
          style={{
            borderRadius: "24px",
          }}
          className="pointer-events-auto relative flex md:max-h-max max-h-[75dvh] flex-col overflow-hidden border border-zinc-50/10 bg-[#27272a] w-[85dvw] sm:w-[500px]">
          <img src={data.profileImage} alt="Profile Image" className="md:h-full h-[40dvh] w-full" />
          <div className="flex flex-col p-6 gap-2 md:h-auto h-[30dvh] overflow-y-scroll">
            <div className="bg-[#18181B] rounded-lg p-4">
              <div className="text-2xl text-white">
                {data.hasADDomainChecked ? data.allDomainName : data.hasSNSDomainChecked ? data.snsName : data.username}
                , {data.age}
              </div>
              <div className="text-gray-400">{data.bio}</div>
            </div>
            <MorphingDialogDescription
              disableLayoutAnimation
              className="flex flex-col gap-2 md:overflow-hidden"
              variants={{
                initial: { opacity: 0, scale: 0.8, y: 100 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.8, y: 100 },
              }}>
              <div className="bg-[#18181B] rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3 text-gray-200">Preferred Drinks</h4>
                <div className="flex gap-2 flex-wrap">
                  {data.drinks.map((drink: string, index: number) => (
                    <span
                      key={index}
                      className="bg-[#7C3AED] bg-opacity-10 text-[#7C3AED] px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                      <DrinkIcon drink={drink} route="profile" />
                      {drink}
                    </span>
                  ))}
                </div>
              </div>
              {data?.communities !== undefined && data?.communities?.length > 0 ? (
                <div className="bg-[#18181B] rounded-lg p-4 overflow-y-auto">
                  <h4 className="text-sm font-semibold mb-3 text-gray-200">Communities</h4>
                  <div className="flex gap-2 flex-wrap">
                    {data?.communities.map((community: string, index: number) => {
                      const meta = COMMUNITIES.find((c) => c.mint === community);
                      return (
                        <div
                          key={index}
                          style={{ backgroundColor: meta?.badgeColor, color: meta?.textColor }}
                          className={`${meta?.badgeColor} px-3 py-1.5 rounded-full text-sm flex font-medium font-mono items-center gap-2 text-white`}>
                          {meta?.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-[#18181B] rounded-lg p-4 max-h-40 overflow-y-auto">
                  <h4 className="text-sm font-semibold mb-3 text-gray-200">Communities</h4>
                  <div className="flex gap-2 flex-wrap">
                    <p className="text-sm text-gray-500 italic">No communities available</p>
                  </div>
                </div>
              )}
            </MorphingDialogDescription>
          </div>
          <MorphingDialogClose className="bg-zinc-800 text-violet-500 mt-3 p-1 rounded-lg" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
};
