
export default function Navbar({onlineCount}: {onlineCount: number | null}){

    return (
        <div className="flex items-center justify-between px-10 py-6 shadow-xl z-10 bg-white">
            <div className="flex items-center gap-16">
                <p className="lg:text-5xl text-lg font-bold">TalkSphere</p>
                <p className="text-xl font-semibold max-lg:hidden">Talk to Strangers!</p>
            </div>
            {onlineCount && <p className="lg:text-2xl">{onlineCount} Online Now</p>}
        </div>
    )
}