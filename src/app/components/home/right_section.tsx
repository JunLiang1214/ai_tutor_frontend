import Image from "next/image";
interface HomeRightSectionComponentProps {
	onDisableSpeech: () => void;
	speaking: boolean;
	audioLessonEnabled: boolean;
}
export function HomeRightSectionComponent({ onDisableSpeech, audioLessonEnabled, speaking }: HomeRightSectionComponentProps) {
	return (
		<div className="w-[30%] h-full border-[1px] border-l-gray-300">
      <div className="p-3 flex-col flex space-y-4 text-[#7160A8]">
        <Image src="/bot_avatar_lg.png" height={282} width={379} alt="new" />
        <div className="bg-yellow-50 p-4 rounded-xl w-full">
          <div className="flex items-center">
            <div className="flex flex-col space-y-4 w-full">
              <div className="flex flex-wrap text-[12px] py-2 flex-row">
                <button
                  disabled={speaking}
                  onClick={onDisableSpeech}
                  className="bg-transparent border hover:cursor-pointer hover:border-[#7e22ce] rounded p-2 m-1 border-[#7160A8]"
                >
                  {!audioLessonEnabled ? `Enable` : `Disable`} Audio Lesson
                </button>
                {/* <button className="bg-transparent border rounded p-2 m-1 border-[#7160A8]">
                  Solve with Modal
                </button>
                <button className="bg-transparent border rounded p-2 m-1 border-[#7160A8]">
                  Solve with Ratio
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
	)
}